export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string; // external or blob
  synthPreset?: 'festival_drop' | 'deep_groove' | 'persian_club' | 'melodic_techno' | 'tech_house';
  genre: string;
  bpm: number;
  plays: number;
  likes: number;
  releaseDate: string;
  isVipOnlyDownload: boolean;
  description?: string;
  lyrics?: string;
  fileSize?: string;
}

export interface VipTicket {
  id: string;
  userId?: string;
  receiptPath?: string;
  userName: string;
  userContact: string; // phone or email or telegram
  method: 'card' | 'crypto';
  amount: string; // e.g. "10 USDT" or "3,000,000 Toman"
  cryptoNetwork?: 'TRC-20' | 'BEP-20' | 'TON';
  txHashOrReceiptNo: string;
  receiptImageData?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewDate?: string;
  adminNote?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  email?: string;
  role: 'admin' | 'user';
  isVip: boolean;
  vipSince?: string;
  likedTrackIds: string[];
  customPlaylists?: Playlist[];
  avatarUrl: string;
  createdAt: string;
  downloadCount?: number;
}

export interface UserState {
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
}

