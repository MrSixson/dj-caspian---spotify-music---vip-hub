import { supabase } from './client';
import type { Playlist, Track } from '../../types';

type TrackRow = {
  id: string; title: string; artist: string; album: string; duration: string;
  cover_path: string | null; audio_path: string | null; synth_preset: string | null;
  genre: string | null; bpm: number | null; plays: number; likes: number;
  release_date: string | null; is_vip_only_download: boolean; description: string | null;
  lyrics: string | null; file_size: string | null; audio_sha256: string | null;
};

type PlaylistRow = {
  id: string; title: string; description: string; cover_path: string | null;
};

const PRESET_VALUES = ['festival_drop', 'deep_groove', 'persian_club', 'melodic_techno', 'tech_house'] as const;

function secondsFromDuration(value: string): number {
  const raw = value.trim();
  if (/^\d+(\.\d+)?$/.test(raw)) return Math.max(0, Math.round(Number(raw)));
  const parts = raw.split(':').map(Number);
  if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function durationToText(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

async function signedAudioUrl(path: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  const { data, error } = await supabase.storage.from('tracks').createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('Could not create audio signed URL:', error.message);
    return undefined;
  }
  return data.signedUrl;
}

function coverUrl(path: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return supabase.storage.from('covers').getPublicUrl(path).data.publicUrl;
}

async function mapTrack(row: TrackRow): Promise<Track> {
  const preset = PRESET_VALUES.includes(row.synth_preset as (typeof PRESET_VALUES)[number])
    ? (row.synth_preset as Track['synthPreset'])
    : 'festival_drop';
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    duration: secondsFromDuration(row.duration),
    coverUrl: coverUrl(row.cover_path),
    audioUrl: await signedAudioUrl(row.audio_path),
    synthPreset: preset,
    genre: row.genre || 'Electronic',
    bpm: row.bpm || 0,
    plays: Number(row.plays || 0),
    likes: Number(row.likes || 0),
    releaseDate: row.release_date || '',
    isVipOnlyDownload: row.is_vip_only_download,
    description: row.description || '',
    lyrics: row.lyrics || '',
    fileSize: row.file_size || '',
  };
}

export async function loadCatalog(userId?: string): Promise<{ tracks: Track[]; playlists: Playlist[]; likedTrackIds: string[] }> {
  const [trackResult, playlistResult, likesResult] = await Promise.all([
    supabase.from('tracks').select('*').order('created_at', { ascending: false }),
    supabase.from('playlists').select('id,title,description,cover_path').order('created_at', { ascending: false }),
    userId
      ? supabase.from('user_likes').select('track_id').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (trackResult.error) throw new Error(`دریافت آهنگ‌ها ناموفق بود: ${trackResult.error.message}`);
  if (playlistResult.error) throw new Error(`دریافت پلی‌لیست‌ها ناموفق بود: ${playlistResult.error.message}`);
  if (likesResult.error) throw new Error(`دریافت علاقه‌مندی‌ها ناموفق بود: ${likesResult.error.message}`);

  const rows = (trackResult.data || []) as TrackRow[];
  const tracks = await Promise.all(rows.map(mapTrack));
  const playlistRows = (playlistResult.data || []) as PlaylistRow[];
  const playlistIds = playlistRows.map((p) => p.id);
  let membership: { playlist_id: string; track_id: string }[] = [];

  if (playlistIds.length) {
    const { data, error } = await supabase
      .from('playlist_tracks')
      .select('playlist_id,track_id')
      .in('playlist_id', playlistIds)
      .order('position', { ascending: true });
    if (error) throw new Error(`دریافت آهنگ‌های پلی‌لیست ناموفق بود: ${error.message}`);
    membership = data || [];
  }

  const playlists: Playlist[] = playlistRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    coverUrl: coverUrl(row.cover_path),
    trackIds: membership.filter((item) => item.playlist_id === row.id).map((item) => item.track_id),
  }));

  return {
    tracks,
    playlists,
    likedTrackIds: (likesResult.data || []).map((item: { track_id: string }) => item.track_id),
  };
}

export async function toggleTrackLike(userId: string, trackId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase.from('user_likes').delete().eq('user_id', userId).eq('track_id', trackId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('user_likes').insert({ user_id: userId, track_id: trackId });
    if (error) throw new Error(error.message);
  }
}

async function getAudioSha256(file: File): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('');
}

export async function deleteTrackAssets(trackId: string): Promise<{ storageCleanupPending: boolean }> {
  const { data, error } = await supabase.rpc('admin_delete_track', { p_track_id: trackId });
  if (error) throw new Error(`حذف آهنگ از دیتابیس ناموفق بود: ${error.message}`);

  const paths = data as { audio_path?: string | null; cover_path?: string | null } | null;
  const removals = await Promise.all([
    paths?.audio_path ? supabase.storage.from('tracks').remove([paths.audio_path]) : Promise.resolve({ error: null }),
    paths?.cover_path && !paths.cover_path.startsWith('http://') && !paths.cover_path.startsWith('https://') && !paths.cover_path.startsWith('data:')
      ? supabase.storage.from('covers').remove([paths.cover_path])
      : Promise.resolve({ error: null }),
  ]);
  const storageCleanupPending = removals.some((result) => Boolean(result.error));
  if (storageCleanupPending) console.error('[CATALOG] Track row deleted; Storage cleanup needs retry.', removals);
  return { storageCleanupPending };
}

export async function uploadTrackAssets(input: {
  audioFile: File;
  coverFile?: File;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  genre: string;
  bpm: number;
  synthPreset?: string;
  isVipOnlyDownload: boolean;
  description?: string;
  coverUrl?: string;
}): Promise<Track> {
  const audioHash = await getAudioSha256(input.audioFile);
  const { data: duplicate, error: duplicateError } = await supabase
    .from('tracks')
    .select('id')
    .eq('audio_sha256', audioHash)
    .maybeSingle();

  if (duplicateError) {
    throw new Error(`بررسی فایل تکراری ناموفق بود: ${duplicateError.message}. migration مربوط به یکپارچگی آهنگ‌ها باید در Supabase اجرا شود.`);
  }
  if (duplicate) throw new Error('این فایل صوتی قبلاً در کاتالوگ ثبت شده است.');

  const safeBase = input.audioFile.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || 'track';
  const extension = input.audioFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mp3';
  const unique = crypto.randomUUID();
  const audioPath = `${unique}/${safeBase}.${extension}`;
  const audioUpload = await supabase.storage.from('tracks').upload(audioPath, input.audioFile, {
    contentType: input.audioFile.type || 'audio/mpeg',
    upsert: false,
  });
  if (audioUpload.error) throw new Error(`آپلود فایل صوتی ناموفق بود: ${audioUpload.error.message}`);

  let coverPath: string | null = null;
  if (input.coverFile) {
    const extension = input.coverFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
    coverPath = `${unique}/cover.${extension}`;
    const coverUpload = await supabase.storage.from('covers').upload(coverPath, input.coverFile, {
      contentType: input.coverFile.type || 'image/jpeg',
      upsert: false,
    });
    if (coverUpload.error) {
      await supabase.storage.from('tracks').remove([audioPath]);
      throw new Error(`آپلود کاور ناموفق بود: ${coverUpload.error.message}`);
    }
  }

  const insertRow = {
    title: input.title.trim(),
    artist: input.artist.trim() || 'DJ Caspian',
    album: input.album.trim() || 'Caspian Singles',
    duration: durationToText(input.durationSeconds),
    cover_path: coverPath || input.coverUrl || null,
    audio_path: audioPath,
    audio_sha256: audioHash,
    synth_preset: input.synthPreset || null,
    genre: input.genre || null,
    bpm: Number(input.bpm) || null,
    plays: 0,
    likes: 0,
    release_date: new Date().toISOString().slice(0, 10),
    is_vip_only_download: input.isVipOnlyDownload,
    description: input.description?.trim() || null,
    lyrics: null,
    file_size: `${(input.audioFile.size / (1024 * 1024)).toFixed(2)} MB`,
  };

  const { data, error } = await supabase.from('tracks').insert(insertRow).select('*').single();
  if (error || !data) {
    await supabase.storage.from('tracks').remove([audioPath]);
    if (coverPath) await supabase.storage.from('covers').remove([coverPath]);
    throw new Error(`ثبت آهنگ در دیتابیس ناموفق بود: ${error?.message || 'پاسخی از دیتابیس دریافت نشد'}`);
  }
  return mapTrack(data as TrackRow);
}
