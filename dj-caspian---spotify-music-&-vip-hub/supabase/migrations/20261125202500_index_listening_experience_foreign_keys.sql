create index if not exists listening_history_track_id_idx on public.listening_history(track_id);
create index if not exists listening_rooms_host_user_id_idx on public.listening_rooms(host_user_id);
create index if not exists listening_rooms_track_id_idx on public.listening_rooms(track_id);
create index if not exists listening_room_messages_user_id_idx on public.listening_room_messages(user_id);
