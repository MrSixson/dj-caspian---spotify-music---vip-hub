import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Headphones, Radio, Send, Users, Sparkles, Clock3, Music2 } from 'lucide-react';
import type { Track, UserAccount } from '../types';
import { supabase } from '../lib/supabase';

type Room = { id: string; name: string; host_user_id: string; track_id: string | null; position_seconds: number; is_playing: boolean; updated_at: string };
type Message = { id: string; username: string; message: string; created_at: string };

type Props = {
  tracks: Track[];
  recentTrackIds: string[];
  likedTrackIds: string[];
  currentTrack: Track | null;
  currentTime: number;
  isPlaying: boolean;
  user: UserAccount | null;
  onPlayTrack: (track: Track) => void;
  onSyncPlayback: (trackId: string, position: number, playing: boolean) => void;
};

export const ListeningHub: React.FC<Props> = ({ tracks, recentTrackIds, likedTrackIds, currentTrack, currentTime, isPlaying, user, onPlayTrack, onSyncPlayback }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomName, setRoomName] = useState('اتاق شنیدن کاسپین');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const livePlayback = React.useRef({ currentTrack, currentTime, isPlaying, onSyncPlayback });
  livePlayback.current = { currentTrack, currentTime, isPlaying, onSyncPlayback };

  const recommendations = useMemo(() => {
    const preferred = new Set([...likedTrackIds, ...recentTrackIds].slice(0, 12));
    const seed = tracks.filter(t => preferred.has(t.id));
    const genres = new Map<string, number>();
    const artists = new Map<string, number>();
    seed.forEach(t => { genres.set(t.genre, (genres.get(t.genre) || 0) + 2); artists.set(t.artist, (artists.get(t.artist) || 0) + 1); });
    return [...tracks].sort((a,b) => {
      const score = (t: Track) => (preferred.has(t.id) ? 100 : 0) - (genres.get(t.genre) || 0) * 4 - (artists.get(t.artist) || 0) * 2 - Math.min(t.plays || 0, 100) / 100;
      return score(a) - score(b);
    }).slice(0, 6);
  }, [tracks, recentTrackIds, likedTrackIds]);

  useEffect(() => {
    if (!user?.id) { setHistory([]); setRooms([]); return; }
    let active = true;
    const load = async () => {
      const [historyResult, roomResult] = await Promise.all([
        supabase.from('listening_history').select('track_id,listened_seconds,completed,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500),
        supabase.from('listening_rooms').select('id,name,host_user_id,track_id,position_seconds,is_playing,updated_at').eq('is_public', true).order('created_at', { ascending: false }).limit(30),
      ]);
      if (!active) return;
      if (!historyResult.error) setHistory(historyResult.data || []);
      if (!roomResult.error) setRooms(roomResult.data || []);
    };
    void load();
    const channel = supabase.channel('caspian-listening-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listening_rooms' }, () => { void load(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!room) { setMessages([]); return; }
    let active = true;
    const loadMessages = async () => {
      const { data } = await supabase.from('listening_room_messages').select('id,username,message,created_at').eq('room_id', room.id).order('created_at', { ascending: true }).limit(100);
      if (active) setMessages(data || []);
    };
    void loadMessages();
    if (room.host_user_id !== user?.id && room.track_id) {
      onSyncPlayback(room.track_id, Number(room.position_seconds || 0), Boolean(room.is_playing));
    }
    const channel = supabase.channel('caspian-room-' + room.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listening_room_messages', filter: 'room_id=eq.' + room.id }, payload => {
        const row = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === row.id) ? prev : [...prev, row].slice(-100));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listening_rooms', filter: 'id=eq.' + room.id }, payload => {
        const updated = payload.new as Room;
        setRoom(updated);
        if (updated.host_user_id !== user?.id && updated.track_id) livePlayback.current.onSyncPlayback(updated.track_id, Number(updated.position_seconds || 0), Boolean(updated.is_playing));
      })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [room?.id, user?.id]);

  useEffect(() => {
    if (!room || room.host_user_id !== user?.id || !currentTrack) return;
    const timer = window.setInterval(() => {
      const live = livePlayback.current;
      if (!live.currentTrack) return;
      void supabase.from('listening_rooms').update({
        track_id: live.currentTrack.id,
        position_seconds: Math.floor(live.currentTime),
        is_playing: live.isPlaying,
        updated_at: new Date().toISOString(),
      }).eq('id', room.id).eq('host_user_id', user.id);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [room?.id, room?.host_user_id, user?.id]);

  const createRoom = async () => {
    if (!user) { setNotice('برای ساخت اتاق ابتدا وارد حساب کاربری شوید.'); return; }
    setBusy(true); setNotice('');
    const { data, error } = await supabase.from('listening_rooms').insert({ name: roomName.trim() || 'اتاق شنیدن کاسپین', host_user_id: user.id, track_id: currentTrack?.id || null, position_seconds: currentTime, is_playing: isPlaying, is_public: true }).select('*').single();
    setBusy(false);
    if (error || !data) { setNotice('ساخت اتاق ناموفق بود: ' + (error?.message || 'خطای نامشخص')); return; }
    setRoom(data as Room); setRooms(prev => [data as Room, ...prev]);
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !room || !message.trim()) return;
    const value = message.trim().slice(0, 500); setMessage('');
    const { error } = await supabase.from('listening_room_messages').insert({ room_id: room.id, user_id: user.id, username: user.username, message: value });
    if (error) setNotice('ارسال پیام انجام نشد: ' + error.message);
  };

  const syncNow = async () => {
    if (!room || room.host_user_id !== user?.id || !currentTrack) return;
    const { error } = await supabase.from('listening_rooms').update({ track_id: currentTrack.id, position_seconds: currentTime, is_playing: isPlaying, updated_at: new Date().toISOString() }).eq('id', room.id);
    setNotice(error ? 'همگام‌سازی ناموفق بود: ' + error.message : 'وضعیت پخش برای اعضای اتاق ارسال شد.');
  };

  const totalSeconds = history.reduce((sum, item) => sum + Number(item.listened_seconds || 0), 0);
  const topTrackId = Object.entries(history.reduce((acc: Record<string, number>, item) => { acc[item.track_id] = (acc[item.track_id] || 0) + Number(item.listened_seconds || 0); return acc; }, {})).sort((a,b) => b[1]-a[1])[0]?.[0];
  const topTrack = tracks.find(t => t.id === topTrackId);

  return <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8" dir="rtl">
    <section className="rounded-[2rem] border border-[#d6b45c]/25 bg-gradient-to-br from-[#153451] via-[#091522] to-black p-6 sm:p-9">
      <div className="text-[10px] tracking-[.3em] font-black text-[#d6b45c]">CASPIAN LISTENING INTELLIGENCE</div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white">تجربه شنیدن کاسپین</h1>
      <p className="mt-2 text-sm text-slate-300">میکس پیشنهادی، آمار شخصی و اتاق‌های شنیدن گروهی، در یک فضای مشترک.</p>
    </section>

    <section className="space-y-4">
      <div className="flex items-center gap-2"><Sparkles className="text-[#d6b45c]"/><h2 className="text-xl font-black text-white">میکس مخصوص تو</h2></div>
      <p className="text-xs text-slate-400">پیشنهادها با توجه به لایک‌ها، آهنگ‌های اخیر و سبک‌های مورد علاقه‌ات مرتب شده‌اند.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {recommendations.map(track => <button key={track.id} onClick={() => onPlayTrack(track)} className="text-right rounded-2xl border border-white/10 bg-[#0b1725] p-3 hover:border-[#d6b45c]/40">
          <img src={track.coverUrl} alt="" className="w-full aspect-square rounded-xl object-cover mb-3"/>
          <b className="block text-sm text-white truncate">{track.title}</b><span className="block text-xs text-slate-500 truncate mt-1">{track.artist}</span>
        </button>)}
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex items-center gap-2"><Activity className="text-[#d6b45c]"/><h2 className="text-xl font-black text-white">آمار شنیدن من</h2></div>
      {!user ? <p className="text-sm text-slate-400">برای ذخیره و مشاهده آمار شخصی وارد حساب کاربری شو.</p> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b1725] p-5"><Headphones className="text-[#d6b45c] mb-3"/><b className="text-2xl text-white">{Math.floor(totalSeconds/60).toLocaleString('fa-IR')}</b><p className="text-xs text-slate-500 mt-1">دقیقه شنیدن ثبت‌شده</p></div>
        <div className="rounded-2xl border border-white/10 bg-[#0b1725] p-5"><Music2 className="text-[#d6b45c] mb-3"/><b className="text-2xl text-white">{new Set(history.map(h=>h.track_id)).size.toLocaleString('fa-IR')}</b><p className="text-xs text-slate-500 mt-1">آهنگ متفاوت</p></div>
        <div className="col-span-2 md:col-span-1 rounded-2xl border border-white/10 bg-[#0b1725] p-5"><Clock3 className="text-[#d6b45c] mb-3"/><b className="block text-base text-white truncate">{topTrack?.title || 'هنوز آماری نیست'}</b><p className="text-xs text-slate-500 mt-1">بیشترین زمان شنیدن</p></div>
      </div>}
    </section>

    <section className="space-y-4">
      <div className="flex items-center gap-2"><Radio className="text-[#d6b45c]"/><h2 className="text-xl font-black text-white">اتاق‌های شنیدن گروهی</h2></div>
      <div className="rounded-2xl border border-[#d6b45c]/20 bg-[#0b1725] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2"><input value={roomName} onChange={e=>setRoomName(e.target.value)} maxLength={60} placeholder="نام اتاق" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"/><button disabled={busy || !user} onClick={()=>void createRoom()} className="rounded-xl bg-[#d6b45c] px-5 py-3 text-sm font-black text-black disabled:opacity-40">ساخت اتاق جدید</button></div>
        {rooms.length ? <div className="grid sm:grid-cols-2 gap-2">{rooms.map(item=><button key={item.id} onClick={()=>setRoom(item)} className={`rounded-xl border p-3 text-right ${room?.id===item.id?'border-[#d6b45c]/60 bg-[#d6b45c]/10':'border-white/10 bg-black/20'}`}><b className="block text-sm text-white">{item.name}</b><span className="text-[11px] text-slate-500">{item.is_playing?'در حال پخش':'متوقف'} · {item.host_user_id===user?.id?'میزبان شما':'اتاق عمومی'}</span></button>)}</div> : <p className="text-xs text-slate-500">هنوز اتاق عمومی فعالی ساخته نشده است.</p>}
        {room && <div className="rounded-2xl border border-[#d6b45c]/20 bg-black/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2"><div><b className="text-white">{room.name}</b><p className="text-[10px] text-slate-500 mt-1">{room.host_user_id===user?.id?'شما میزبان این اتاق هستید':'به اتاق پیوستید'}</p></div><button onClick={()=>setRoom(null)} className="text-xs text-slate-400">خروج از اتاق</button></div>
          {room.host_user_id===user?.id && <button onClick={()=>void syncNow()} className="rounded-lg bg-[#d6b45c] px-3 py-2 text-xs font-bold text-black">همگام‌سازی پخش فعلی برای همه</button>}
          <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl bg-black/20 p-3">{messages.map(m=><div key={m.id} className="text-xs"><b className="text-[#d6b45c]">{m.username}</b><span className="text-slate-300 mr-2">{m.message}</span></div>)}{!messages.length&&<p className="text-xs text-slate-600">هنوز پیامی نیست. شروع‌کننده باش.</p>}</div>
          <form onSubmit={sendMessage} className="flex gap-2"><input value={message} onChange={e=>setMessage(e.target.value)} maxLength={500} placeholder="پیام برای اعضای اتاق..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"/><button disabled={!user||!message.trim()} className="rounded-xl bg-[#d6b45c] px-4 text-black disabled:opacity-40"><Send className="w-4 h-4"/></button></form>
        </div>}
      </div>
      {notice && <p className="text-xs text-amber-200">{notice}</p>}
      {!user && <p className="text-xs text-slate-500 flex items-center gap-2"><Users className="w-4 h-4"/> ورود برای ساخت اتاق و گفتگو لازم است.</p>}
    </section>
  </div>;
};
