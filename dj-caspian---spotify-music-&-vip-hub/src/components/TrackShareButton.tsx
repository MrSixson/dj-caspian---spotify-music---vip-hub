import React, { useState } from 'react';
import { Share2, Download } from 'lucide-react';

type Props = { title: string; artist: string; coverUrl?: string };

export const TrackShareButton: React.FC<Props> = ({ title, artist, coverUrl }) => {
  const [busy, setBusy] = useState(false);

  const makeCard = async (): Promise<File> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('امکان ساخت کارت وجود ندارد.');
    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, '#101e32');
    bg.addColorStop(0.55, '#090d15');
    bg.addColorStop(1, '#241b0c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = 'rgba(214,180,92,.10)';
    ctx.beginPath(); ctx.arc(1040, 110, 260, 0, Math.PI * 2); ctx.fill();
    if (coverUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = coverUrl;
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('cover')); });
        const size = 390;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 35;
        ctx.beginPath(); ctx.roundRect(735, 120, size, size, 28); ctx.clip();
        ctx.drawImage(img, 735, 120, size, size);
        ctx.restore();
      } catch { /* Continue with a clean branded card if artwork blocks canvas access. */ }
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e7c875'; ctx.font = 'bold 28px Arial'; ctx.fillText('DJ CASPIAN  •  OFFICIAL MUSIC UNIVERSE', 680, 190);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 58px Arial';
    const safeTitle = title.length > 24 ? title.slice(0, 23) + '…' : title;
    ctx.fillText(safeTitle, 680, 310);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '36px Arial'; ctx.fillText(artist, 680, 375);
    ctx.fillStyle = '#d6b45c'; ctx.fillRect(90, 490, 1020, 2);
    ctx.fillStyle = '#94a3b8'; ctx.font = '24px Arial'; ctx.fillText('LISTEN NOW  •  DJ CASPIAN', 1110, 545);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('ساخت تصویر ناموفق بود.')), 'image/png'));
    return new File([blob], 'dj-caspian-track.png', { type: 'image/png' });
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const file = await makeCard();
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: title + ' • DJ Caspian', text: artist + ' | DJ Caspian', files: [file] });
      } else {
        const url = URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'dj-caspian-track.png'; anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) console.error('Track card share failed:', error);
    } finally { setBusy(false); }
  };

  return <button type="button" onClick={handleShare} disabled={busy} title="ساخت و اشتراک کارت آهنگ"
    aria-label="ساخت و اشتراک کارت آهنگ" className="text-neutral-400 hover:text-[#e7c875] disabled:opacity-50">
    {busy ? <Download className="w-4 h-4 animate-pulse" /> : <Share2 className="w-4 h-4" />}
  </button>;
};
