import { supabase } from './supabase';
import type { Playlist, Track } from '../types';

type TrackRow = {
  id: string; title: string; artist: string; album: string; duration: string;
  cover_path: string | null; audio_path: string | null; synth_preset: string | null;
  genre: string | null; bpm: number | null; plays: number; likes: number;
  release_date: string | null; is_vip_only_download: boolean; description: string | null;
  lyrics: string | null; file_size: string | null;
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

function audioStreamUrl(trackId: string): string {
  return `https://irkdzjizhwxbmnnfyqsx.supabase.co/functions/v1/audio-gateway?track_id=${encodeURIComponent(trackId)}&mode=stream`;
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
    audioUrl: row.audio_path ? audioStreamUrl(row.id) : undefined,
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
    supabase.from('tracks').select('*').eq('is_deleting', false).order('created_at', { ascending: false }),
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

async function validateMp3File(file: File): Promise<void> {
  if (!/\.mp3$/i.test(file.name)) {
    throw new Error('فقط فایل با پسوند MP3 قابل آپلود است.');
  }

  // Browsers and operating systems report inconsistent MIME types for valid MP3 files.
  // The extension and MPEG/ID3 signature checks below are the reliable validation.

  if (file.size < 4 || file.size > 50 * 1024 * 1024) {
    throw new Error('حجم فایل MP3 باید بیشتر از صفر و حداکثر ۵۰ مگابایت باشد.');
  }

  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const hasId3Header = header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33;
  const hasMpegFrameSync = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
  if (!hasId3Header && !hasMpegFrameSync) {
    throw new Error('محتوای فایل با ساختار MP3 سازگار نیست. فایل صوتی اصلی را انتخاب کن.');
  }
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
  await validateMp3File(input.audioFile);

  const safeBase = input.audioFile.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || 'track';
  const unique = crypto.randomUUID();
  const audioPath = `${unique}/${safeBase}.mp3`;
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
