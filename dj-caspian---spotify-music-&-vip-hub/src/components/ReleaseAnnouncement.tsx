import React, { useEffect, useState } from 'react';

type ReleaseNote = { version: string; title: string; date: string; intro: string; sections: { title: string; items: string[] }[] };

export function ReleaseAnnouncement() {
  const [note, setNote] = useState<ReleaseNote | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}changelog.json?ts=${Date.now()}`, { cache: 'no-store' })
      .then((response) => { if (!response.ok) throw new Error('Release notes unavailable'); return response.json(); })
      .then((data: ReleaseNote) => {
        if (!alive || !data?.version) return;
        setNote(data);
        try {
          if (localStorage.getItem('dj-caspian-seen-release') !== data.version) setOpen(true);
        } catch { setOpen(true); }
      })
      .catch((error) => console.warn('Could not load release announcement:', error));
    return () => { alive = false; };
  }, []);

  const dismiss = () => {
    try { if (note) localStorage.setItem('dj-caspian-seen-release', note.version); } catch {}
    setOpen(false);
  };

  if (!open || !note) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="release-title" dir="rtl"
      style={{ position:'fixed', inset:0, zIndex:10000, display:'grid', placeItems:'center', padding:16, background:'rgba(0,0,0,.82)', backdropFilter:'blur(12px)' }}>
      <section style={{ width:'min(680px,100%)', maxHeight:'min(86vh,850px)', overflowY:'auto', border:'1px solid rgba(214,180,92,.42)', borderRadius:26, background:'linear-gradient(145deg,#171b24,#090b10 72%)', color:'#f8fafc', boxShadow:'0 30px 100px rgba(0,0,0,.65)' }}>
        <header style={{ padding:'26px 26px 18px', background:'radial-gradient(ellipse at top right,rgba(214,180,92,.22),transparent 65%)' }}>
          <div style={{ color:'#e5c878', fontSize:12, fontWeight:800, letterSpacing:2 }}>DJ CASPIAN • WHAT'S NEW</div>
          <div style={{ fontSize:30, fontWeight:900, marginTop:10, lineHeight:1.35 }} id="release-title">{note.title}</div>
          <div style={{ color:'#a1a1aa', fontSize:12, marginTop:8 }}>{note.date}　·　نسخه {note.version}</div>
          <p style={{ color:'#d4d4d8', lineHeight:1.9, marginTop:16, fontSize:14 }}>{note.intro}</p>
        </header>
        <div style={{ padding:'0 26px 22px', display:'grid', gap:14 }}>
          {note.sections.map((section) => (
            <article key={section.title} style={{ border:'1px solid rgba(255,255,255,.09)', borderRadius:16, padding:16, background:'rgba(255,255,255,.035)' }}>
              <h3 style={{ color:'#e7ca7c', fontSize:15, fontWeight:800, margin:'0 0 9px' }}>{section.title}</h3>
              <ul style={{ margin:0, paddingRight:20, color:'#d4d4d8', fontSize:13, lineHeight:2 }}>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
          <button onClick={dismiss} style={{ border:0, borderRadius:14, padding:'15px 20px', background:'linear-gradient(100deg,#e5c878,#b88d36)', color:'#111', fontWeight:900, fontSize:14, cursor:'pointer' }}>
            متوجه شدم، بریم سراغ موسیقی 🎧
          </button>
          <div style={{ textAlign:'center', color:'#71717a', fontSize:11 }}>این اطلاعیه فقط یک‌بار برای هر نسخه نمایش داده می‌شود.</div>
        </div>
      </section>
    </div>
  );
}
