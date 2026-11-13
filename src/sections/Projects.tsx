import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import type { Lang } from './About';
import { PROJECTS } from '../data/projects';
import type { Project } from '../data/projects';

const EMAIL = 'adododjialban@gmail.com';

const TXT = {
  fr: {
    eyebrow: 'Sélection de travaux',
    title: 'Projets',
    hint: 'Fais défiler pour ouvrir le livre',
    coverSub: 'Arnold Adododji',
    coverTag: 'Portfolio',
    toc: 'Sommaire',
    intro: 'Chaque page est un projet. Tourne la page, ou choisis un titre dans le sommaire.',
    closeTitle: 'Un projet en tête ?',
    closeText: 'Parlons-en.',
    cta: 'Me contacter',
    view: 'Voir le projet',
  },
  en: {
    eyebrow: 'Selected work',
    title: 'Projects',
    hint: 'Scroll to open the book',
    coverSub: 'Arnold Adododji',
    coverTag: 'Portfolio',
    toc: 'Contents',
    intro: 'Every page is a project. Turn the page, or pick a title from the contents.',
    closeTitle: 'Got a project in mind?',
    closeText: 'Let’s talk.',
    cta: 'Get in touch',
    view: 'View project',
  },
} as const;

type Pg =
  | { k: 'contents' }
  | { k: 'project'; p: Project; n: number; j: number }
  | { k: 'closing' }
  | { k: 'blank' };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
// page turn with a short rest at both ends, so each spread "holds" while you read it
const turn = (u: number) => smooth(clamp((u - 0.18) / 0.64));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- page faces ---------- */
const paper: CSSProperties = { background: 'linear-gradient(135deg,#f6f1e6,#ece5d6)', color: '#17120d' };

function Media({ p, u }: { p: Project; u: number }) {
  const [failed, setFailed] = useState(false);
  const vref = useRef<HTMLVideoElement>(null);
  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1a1714' }}
      onPointerEnter={() => vref.current?.play().catch(() => {})}
      onPointerLeave={() => {
        const v = vref.current;
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }}
    >
      {p.video ? (
        <video ref={vref} src={p.video} poster={p.image} muted loop playsInline preload="metadata" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : !failed ? (
        <img
          src={p.image}
          alt={p.title}
          draggable={false}
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(.22,1,.36,1)' }}
          onPointerEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 20%,#3a332b,#14110e)', color: 'rgba(255,255,255,.25)', fontSize: u * 8, letterSpacing: '-0.03em', textAlign: 'center', padding: u * 4 }}>
          {p.title}
        </div>
      )}
    </div>
  );
}

function PageFace({ pg, side, u, lang, onGo }: { pg: Pg; side: 'left' | 'right'; u: number; lang: Lang; onGo: (j: number) => void }) {
  const t = TXT[lang];
  const gutter =
    side === 'right'
      ? 'linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,.06) 9%,transparent 18%)'
      : 'linear-gradient(270deg,rgba(0,0,0,.30),rgba(0,0,0,.06) 9%,transparent 18%)';
  const pad = u * 5;
  let body: ReactNode = null;

  if (pg.k === 'contents') {
    body = (
      <div style={{ position: 'absolute', inset: 0, padding: `${pad}px ${pad * 1.1}px`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: u * 2.2, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.55 }}>{t.toc}</div>
        <div style={{ marginTop: u * 1.6, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u * 1.1 }}>
          {PROJECTS.map((p, i) => (
            <button
              key={p.title}
              type="button"
              onClick={() => onGo(i + 1)}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: u * 2, borderBottom: '1px solid rgba(0,0,0,.12)', paddingBottom: u * 0.9, fontSize: u * 3.4, letterSpacing: '-0.02em', transition: 'color .2s, padding-left .25s' }}
              onPointerEnter={(e) => { e.currentTarget.style.color = '#c98a10'; e.currentTarget.style.paddingLeft = `${u * 1.2}px`; }}
              onPointerLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.paddingLeft = '0px'; }}
            >
              <span style={{ fontSize: u * 2, opacity: 0.45, width: u * 4 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1 }}>{p.title}</span>
              <span style={{ fontSize: u * 2, opacity: 0.45 }}>{p.year}</span>
            </button>
          ))}
        </div>
      </div>
    );
  } else if (pg.k === 'project') {
    const p = pg.p;
    body = (
      <>
        <Media p={p} u={u} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${u * 6}px ${pad}px ${u * 3.2}px`, background: 'linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.35) 60%,transparent)', color: '#fff', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: u * 1.6 }}>
            <span style={{ fontSize: u * 2.2, opacity: 0.7 }}>{String(pg.n).padStart(2, '0')}</span>
            <span style={{ fontSize: u * 5, letterSpacing: '-0.03em', lineHeight: 1 }}>{p.title}</span>
            <span style={{ marginLeft: 'auto', fontSize: u * 2.1, opacity: 0.7 }}>{p.year}</span>
          </div>
          <div style={{ marginTop: u * 1.2, fontSize: u * 2.3, lineHeight: 1.35, opacity: 0.88, maxWidth: '82%' }}>{p[lang]}</div>
          <div style={{ marginTop: u * 1.4, display: 'flex', gap: u * 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {p.tags.map((tg) => (
              <span key={tg} style={{ fontSize: u * 1.8, border: '1px solid rgba(255,255,255,.45)', borderRadius: 99, padding: `${u * 0.35}px ${u * 1.3}px` }}>{tg}</span>
            ))}
            {p.href && (
              <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ pointerEvents: 'auto', marginLeft: 'auto', fontSize: u * 2, color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                {t.view} ↗
              </a>
            )}
          </div>
        </div>
      </>
    );
  } else if (pg.k === 'closing') {
    body = (
      <div style={{ position: 'absolute', inset: 0, padding: pad, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: u * 2.4 }}>
        <div style={{ fontSize: u * 6, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {t.closeTitle} <span style={{ color: '#c98a10' }}>{t.closeText}</span>
        </div>
        <a href={`mailto:${EMAIL}`} style={{ background: '#111', color: '#fff', borderRadius: 99, padding: `${u * 1.6}px ${u * 3.6}px`, fontSize: u * 2.4, textDecoration: 'none' }}>
          {t.cta}
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...paper }}>
      {body}
      <div style={{ position: 'absolute', inset: 0, background: gutter, pointerEvents: 'none' }} />
    </div>
  );
}

/* ---------- desk props, all drawn in CSS / SVG ---------- */
const flat = (x: number, y: number, rot = 0, z = 0): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transformStyle: 'preserve-3d',
  transform: `translate3d(${x}px,${y}px,${z}px) rotateZ(${rot}deg)`,
});
const disc = (d: number, bg: string, z: number, extra: CSSProperties = {}): CSSProperties => ({
  position: 'absolute', width: d, height: d, left: -d / 2, top: -d / 2, borderRadius: '50%', background: bg, transform: `translateZ(${z}px)`, ...extra,
});

function Props({ pw, ph }: { pw: number; ph: number }) {
  const d = pw * 0.17;
  const ring = [
    { n: 7, r: 21, l: 26, w: 13, c: '#3d6a49', z: 6 },
    { n: 6, r: 14, l: 22, w: 12, c: '#4f8559', z: 11 },
    { n: 5, r: 7, l: 17, w: 10, c: '#6fae75', z: 16 },
  ];
  return (
    <>
      {/* cappuccino */}
      <div style={flat(-pw * 0.86, ph * 0.98, 0)}>
        <div style={disc(d * 1.7, 'rgba(0,0,0,.55)', 0.2, { filter: 'blur(14px)', left: -d * 0.85 + 16, top: -d * 0.85 + 12 })} />
        <div style={disc(d * 1.55, 'radial-gradient(circle,#efece6 55%,#d8d3c8)', 1)} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={disc(d, i < 5 ? '#f3f1ec' : '#fbfaf7', 3 + i * 3, { boxShadow: 'inset 0 0 0 1px #d9d5cc' })} />
        ))}
        <div style={{ ...disc(d * 0.8, 'radial-gradient(circle at 40% 35%,#d7b48a 0 18%,#8a5a36 19% 46%,#4a2a18 70%)', 19) }} />
        <div style={{ position: 'absolute', width: d * 0.5, height: d * 0.36, left: d * 0.46, top: -d * 0.18, border: `${d * 0.07}px solid #f3f1ec`, borderLeft: 'none', borderRadius: '0 60% 60% 0', transform: 'translateZ(10px)' }} />
      </div>

      {/* pencil */}
      <div style={flat(pw * 0.78, ph * 1.02, -12)}>
        <div style={{ position: 'absolute', left: -pw * 0.26, top: -pw * 0.013, width: pw * 0.52, height: pw * 0.026, borderRadius: 4, transform: 'translateZ(2px)', background: 'linear-gradient(90deg,#e7a0a8 0 6%,#b9b9b9 6% 10%,#e0a82e 10% 78%,#e6c9a0 78% 90%,#2b2b2b 90%)', clipPath: 'polygon(0 0,95% 0,100% 50%,95% 100%,0 100%)', boxShadow: '0 6px 8px rgba(0,0,0,.5)' }} />
      </div>

      {/* business cards */}
      <div style={flat(-pw * 0.98, -ph * 0.92, -9)}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', width: pw * 0.3, height: pw * 0.18, left: -pw * 0.15 + i * 5, top: -pw * 0.09 - i * 4, borderRadius: 3, background: i === 2 ? '#111' : '#f4f1ea', transform: `translateZ(${1 + i * 1.5}px) rotateZ(${i * 3 - 3}deg)`, boxShadow: '0 5px 10px rgba(0,0,0,.45)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: pw * 0.02, fontSize: pw * 0.016 }}>
            {i === 2 && (<><b style={{ fontWeight: 500, letterSpacing: '.04em' }}>Arnold Adododji</b><span style={{ opacity: 0.6 }}>Full-Stack</span></>)}
          </div>
        ))}
      </div>

      {/* succulent */}
      <div style={flat(pw * 0.98, -ph * 0.9, 0)}>
        <div style={disc(d * 1.2, 'rgba(0,0,0,.55)', 0.2, { filter: 'blur(12px)', left: -d * 0.6 + 12, top: -d * 0.6 + 10 })} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={disc(d * 0.95, i < 3 ? '#a2674a' : '#3a2a22', 1 + i * 2.5, { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)' })} />
        ))}
        {ring.map((rg, k) => (
          <svg key={k} viewBox="0 0 100 100" style={{ position: 'absolute', width: d * 1.35, height: d * 1.35, left: -d * 0.675, top: -d * 0.675, transform: `translateZ(${rg.z}px)` }}>
            {Array.from({ length: rg.n }).map((_, i) => {
              const a = (i / rg.n) * 360 + k * 20;
              const rad = (a * Math.PI) / 180;
              return <ellipse key={i} cx={50 + Math.cos(rad) * rg.r} cy={50 + Math.sin(rad) * rg.r} rx={rg.l / 2} ry={rg.w / 2} transform={`rotate(${a} ${50 + Math.cos(rad) * rg.r} ${50 + Math.sin(rad) * rg.r})`} fill={rg.c} stroke="rgba(0,0,0,.25)" strokeWidth="0.6" />;
            })}
          </svg>
        ))}
      </div>
    </>
  );
}

/* ---------- section ---------- */
export default function Projects({ lang }: { lang: Lang }) {
  const t = TXT[lang];
  const pages = useMemo<Pg[]>(() => {
    const arr: Pg[] = [{ k: 'contents' }, ...PROJECTS.map((p, i): Pg => ({ k: 'project', p, n: i + 1, j: i + 1 })), { k: 'closing' }];
    if (arr.length % 2) arr.push({ k: 'blank' });
    return arr;
  }, []);
  const L = pages.length / 2;

  const secRef = useRef<HTMLElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);
  const [T, setT] = useState(0);
  const [vp, setVp] = useState({ w: 1440, h: 900 });

  // scroll progress -> T (0 closed ... 1 open on contents ... L+1 last spread)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = secRef.current;
      if (!el) return;
      const dist = Math.max(el.offsetHeight - window.innerHeight, 1);
      const p = clamp(-el.getBoundingClientRect().top / dist);
      setT(p * (L + 1));
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [L]);

  // the view leans gently toward the cursor
  useEffect(() => {
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      if (leanRef.current) leanRef.current.style.transform = `rotateX(${-cur.y * 2.5}deg) rotateY(${cur.x * 4}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToT = (tt: number) => {
    const el = secRef.current;
    if (!el) return;
    const dist = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + clamp(tt / (L + 1)) * dist;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  const goPage = (j: number) => scrollToT(1 + Math.ceil(j / 2));
  const step = (d: number) => scrollToT(clamp(Math.round(T) + d, 0, L + 1) as number);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = secRef.current;
      if (!el || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      const r = el.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight * 0.5) return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onBookClick = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    if (T < 0.5) scrollToT(1);
    else step(e.clientX > window.innerWidth / 2 ? 1 : -1);
  };

  // geometry
  const narrow = vp.w < 700;
  const pw = Math.min(vp.w * (narrow ? 0.47 : 0.38), vp.h * 0.7);
  const ph = pw * 0.625;
  const u = pw / 100;
  const cE = turn(T);
  const tilt = lerp(58, 26, cE);
  const scale = lerp(0.9, 1.12, cE);
  const shift = (-pw / 2) * (1 - cE);
  const headFade = clamp(T / 0.45);

  const leafStyle = (angle: number, z: number): CSSProperties => ({
    position: 'absolute', left: 0, top: -ph / 2, width: pw, height: ph, transformOrigin: 'left center', transformStyle: 'preserve-3d',
    transform: `translateZ(${z}px) rotateY(${angle}deg)`,
  });
  const face = (back = false): CSSProperties => ({ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: back ? 'rotateY(180deg)' : undefined });
  const shade = (f: number): CSSProperties => ({ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#000,transparent)', opacity: 0.45 * Math.sin(Math.PI * f), pointerEvents: 'none' });

  return (
    <section
      id="projets"
      ref={secRef}
      className="relative z-[6] -mt-10 rounded-t-[40px] bg-[#090806]"
      style={{ height: `${(L + 1) * 100 + 100}vh`, boxShadow: '0 -30px 60px rgba(0,0,0,.25)' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden rounded-t-[40px]" style={{ perspective: 1700, perspectiveOrigin: '50% 42%' }}>
        {/* headline: steps aside once the book opens */}
        <div className="absolute z-20 left-[5vw] top-[12vh] pointer-events-none text-[#f1ece2]" style={{ opacity: 1 - headFade, transform: `translateX(${-70 * headFade}px)` }}>
          <div className="text-[12px] sm:text-[14px] uppercase tracking-[.2em] opacity-60 mb-3">{t.eyebrow}</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(44px,8vw,120px)', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
            {t.title}<span className="text-[var(--accent)]">.</span>
          </h2>
        </div>
        <div className="absolute z-20 bottom-[5vh] left-0 right-0 text-center text-[13px] text-[#f1ece2] pointer-events-none" style={{ opacity: 1 - clamp(T / 0.25) }}>
          {t.hint} ↓
        </div>

        {/* lean wrapper (cursor) > desk plane (tilt / push-in) */}
        <div ref={leanRef} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateY(${lerp(vp.h * 0.06, 0, cE)}px) rotateX(${tilt}deg) scale(${scale})` }}>
            {/* lacquered oak desk + pool of lamplight */}
            <div
              style={{
                position: 'absolute', left: '-100%', top: '-100%', width: '300%', height: '300%', transform: 'translateZ(-12px)',
                background:
                  'radial-gradient(ellipse 28% 24% at 50% 50%,rgba(255,206,140,.30),rgba(255,190,110,.10) 55%,transparent 80%),' +
                  'linear-gradient(100deg,transparent 35%,rgba(255,255,255,.05) 50%,transparent 65%),' +
                  'repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 2px,transparent 2px 9px,rgba(0,0,0,.25) 9px 11px,transparent 11px 26px),' +
                  'linear-gradient(#14110d,#0a0806)',
              }}
            />
            {!narrow && <Props pw={pw} ph={ph} />}

            {/* the book: origin = spine */}
            <div
              onClick={onBookClick}
              className="bk-book"
              style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translate3d(${shift}px,0,0)`, cursor: 'pointer' }}
            >
              {/* shadow */}
              <div style={{ position: 'absolute', left: -pw * cE - 6, top: -ph / 2 + 10, width: pw * (1 + cE) + 12, height: ph, background: 'rgba(0,0,0,.75)', filter: 'blur(22px)', transform: 'translateZ(-10px)' }} />
              {/* page-block thickness */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ position: 'absolute', left: 0, top: -ph / 2, width: pw, height: ph, background: i === 6 ? '#0e0c0a' : '#e9e2d2', borderBottom: '1px solid #bdb5a2', transform: `translateZ(${-1 - i * 1.1}px)` }} />
              ))}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ position: 'absolute', left: -pw, top: -ph / 2, width: pw, height: ph, opacity: cE, background: i === 6 ? '#0e0c0a' : '#e9e2d2', borderBottom: '1px solid #bdb5a2', transform: `translateZ(${-1 - i * 1.1}px)` }} />
              ))}

              {/* leaves */}
              {Array.from({ length: L }).map((_, i) => {
                const f = turn(T - 1 - i);
                return (
                  <div key={i} style={leafStyle(-180 * f, lerp((L - i) * 0.6 + 0.4, (i + 1) * 0.6 + 0.4, f) + 45 * Math.sin(Math.PI * f))}>
                    <div style={face()}>
                      <PageFace pg={pages[2 * i]} side="right" u={u} lang={lang} onGo={goPage} />
                      <div style={shade(f)} />
                    </div>
                    <div style={face(true)}>
                      <PageFace pg={pages[2 * i + 1]} side="left" u={u} lang={lang} onGo={goPage} />
                      <div style={{ ...shade(f), background: 'linear-gradient(270deg,#000,transparent)' }} />
                    </div>
                  </div>
                );
              })}

              {/* hardcover */}
              <div style={leafStyle(-180 * cE, lerp((L + 1) * 0.6 + 1, -0.2, cE) + 45 * Math.sin(Math.PI * cE))}>
                <div style={{ ...face(), background: 'radial-gradient(120% 90% at 30% 20%,#262626,#0d0d0d 70%)', borderRadius: '2px 6px 6px 2px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.07), inset 6px 0 14px rgba(0,0,0,.6)', color: '#e9e2d2' }}>
                  <div style={{ position: 'absolute', inset: u * 4, border: '1px solid rgba(201,138,16,.55)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: u * 4 }}>
                    <div style={{ fontSize: u * 2, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c98a10' }}>{t.coverTag}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: u * 11, letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'uppercase', textShadow: '0 1px 0 rgba(255,255,255,.18), 0 -1px 0 rgba(0,0,0,.8)' }}>{t.title}</div>
                      <div style={{ marginTop: u * 2, fontSize: u * 2.4, opacity: 0.7 }}>{t.coverSub}</div>
                    </div>
                  </div>
                </div>
                <div style={face(true)}>
                  <div style={{ position: 'absolute', inset: 0, ...paper, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: u * 6, gap: u * 2 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: u * 7, letterSpacing: '-0.03em', lineHeight: 1 }}>{t.title}<span style={{ color: '#c98a10' }}>.</span></div>
                    <div style={{ fontSize: u * 2.6, lineHeight: 1.45, opacity: 0.75, maxWidth: '80%' }}>{t.intro}</div>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg,rgba(0,0,0,.30),rgba(0,0,0,.06) 9%,transparent 18%)', pointerEvents: 'none' }} />
                  <div style={{ ...shade(cE), background: 'linear-gradient(270deg,#000,transparent)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* soft fade at the top + vignette on screen */}
        <div className="absolute inset-x-0 top-0 h-[26vh] pointer-events-none" style={{ background: 'linear-gradient(180deg,#090806 8%,transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 45%,transparent 45%,rgba(0,0,0,.65))' }} />
      </div>
    </section>
  );
}
