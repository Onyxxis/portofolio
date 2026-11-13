import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTypewriter } from './hooks/useTypewriter';
import About from './sections/About';
import Projects from './sections/Projects';
import type { Lang } from './sections/About';


const SENSITIVITY = 0.8;
const EASE = 0.14; // inertie du défilement vidéo
const START_TIME = 2.3; // instant où tu es de face
const EMAIL = 'adododjialban@gmail.com';
const MAILTO = `mailto:${EMAIL}`;

// TODO: remplace '#' par tes vrais liens (https://...)
const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <>
        <path d="M4 4l11.733 16h4.267l-11.733-16z" />
        <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
      </>
    ),
  },
];

// #competences et #parcours sont des sections de la partie « À propos »
const NAV_HREFS = ['#projets', '#competences', '#parcours', MAILTO];

const T = {
  fr: {
    title: 'Arnold Adododji — Développeur full-stack',
    nav: ['Projets', 'Compétences', 'Parcours', 'Contact'],
    cta: 'Me contacter',
    h1: 'Je suis Arnold ADODODJI, développeur Full-Stack.',
    role: 'Développeur full-stack',
    body:
      'Je conçois et développe des solutions numériques modernes, performantes et intuitives. De l’idée à la mise en production, je transforme les besoins en expériences digitales concrètes.',
    projects: 'Découvrir mes projets',
    cv: 'Télécharger mon CV',
    menu: 'Ouvrir le menu',
    langLabel: 'Langue',
  },
  en: {
    title: 'Arnold Adododji — Full-stack developer',
    nav: ['Projects', 'Skills', 'Journey', 'Contact'],
    cta: 'Get in touch',
    h1: 'I’m Arnold ADODODJI, a Full-Stack developer.',
    role: 'Full-stack developer',
    body:
      'I design and build modern, fast and intuitive digital solutions. From the first idea to production, I turn needs into concrete digital experiences.',
    projects: 'See my projects',
    cv: 'Download my CV',
    menu: 'Toggle menu',
    langLabel: 'Language',
  },
} as const;

const getInitialLang = (): Lang => {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
};

const external = (href: string) =>
  href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const bodyStyle = { fontSize: 'clamp(15px, 1.25vw, 19px)', lineHeight: 1.45 } as const;
const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const targetTime = useRef(START_TIME);
  const currentTime = useRef(START_TIME);
  const seeking = useRef(false);
  const lastSeek = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [opaque, setOpaque] = useState(false); // navigateur sans vidéo transparente (Safari)
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const t = T[lang];

  const { displayed, done } = useTypewriter(t.body, 22, 900);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang, t.title]);

  // Scroll: the stage drifts and zooms slightly, the bottom content fades, the navbar gets a backdrop
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = window.innerHeight;
        const p = Math.min(y / h, 1);
        if (stageRef.current) stageRef.current.style.transform = `translateY(${y * 0.12}px) scale(${1 + p * 0.06})`;
        if (heroRef.current) {
          heroRef.current.style.opacity = String(Math.max(1 - p * 1.6, 0));
          heroRef.current.style.transform = `translateY(${y * 0.15}px)`;
        }
        setScrolled(y > h * 0.7);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pointer scrub (mouse or finger) with easing toward the target time
  useEffect(() => {
    let prevX: number | null = null;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const v = videoRef.current;
      if (!v || !v.duration) return;
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      const offset = (delta / window.innerWidth) * SENSITIVITY * v.duration;
      targetTime.current = Math.min(Math.max(targetTime.current + offset, 0), v.duration);
    };
    const loop = (now: number) => {
      const v = videoRef.current;
      if (v && v.duration) {
        if (seeking.current && now - lastSeek.current > 300) seeking.current = false; // safety
        const diff = targetTime.current - currentTime.current;
        if (!seeking.current && Math.abs(diff) > 0.004) {
          currentTime.current += diff * EASE;
          seeking.current = true;
          lastSeek.current = now;
          v.currentTime = currentTime.current;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* PAGE BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_38%,#fbfaf7_0%,#f4f2ee_55%,#ebe7df_100%)]" />

      {/* STAGE: gold arc + giant name (behind) + transparent video (in front) */}
      <div ref={stageRef} className="hero-stage" aria-hidden={false}>
        <svg
          className="absolute hidden md:block right-[7cqw] bottom-[24cqh] w-[36cqw]"
          viewBox="0 0 400 160"
          fill="none"
          aria-hidden="true"
        >
          <path className="arc" pathLength={1} d="M0 160 C 110 150, 290 110, 400 20" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <h1 className={`hero-name ${opaque ? 'text-[#d9d3c8]' : 'text-[#141414]'}`}>
          <span className="sr-only">{t.h1}</span>
          <span className="w" aria-hidden="true">ARNOLD</span>
          <span className="w" aria-hidden="true">ADODODJI</span>
        </h1>

        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.webp"
          onSeeked={() => {
            seeking.current = false;
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.currentTime = START_TIME;
            setOpaque(!v.currentSrc.endsWith('.webm'));
          }}
          className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2"
          style={opaque ? { mixBlendMode: 'multiply' } : undefined}
        >
          <source src="/hero.webm" type='video/webm; codecs="vp9"' />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-5 sm:px-8 py-3 sm:py-4 transition-all duration-300 ${
          scrolled ? 'bg-[#f4f2ee]/75 backdrop-blur-md' : ''
        }`}
      >
        <a href="#">
          <img src="/logo.png" alt="Arnold Adododji" className="h-11 sm:h-16 w-auto select-none" draggable={false} />
        </a>

        <div className="hidden md:flex items-center gap-9 text-[17px] text-black">
          {t.nav.map((label, i) => (
            <a key={label} href={NAV_HREFS[i]} className="hover:text-[var(--accent)] transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href={MAILTO}
            className="hidden md:inline-flex items-center gap-3 rounded-full bg-black text-white text-[16px] px-6 py-3 hover:bg-[var(--accent)] transition-colors duration-200"
          >
            {t.cta}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          </a>

          {/* LANGUAGE SWITCH: segmented pill with a sliding indicator */}
          <div
            role="group"
            aria-label={t.langLabel}
            className="relative flex items-center rounded-full border border-black/15 bg-white/60 backdrop-blur-md p-1 text-[12px] sm:text-[13px] font-medium tracking-wide select-none shadow-sm"
          >
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: lang === 'en' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            {(['fr', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={`relative z-10 w-9 sm:w-11 py-1.5 rounded-full transition-colors duration-300 ${
                  lang === l ? 'text-white' : 'text-black/60 hover:text-black'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label={t.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-[5px] p-1"
          >
            <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <div
        className="md:hidden fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}
      >
        {t.nav.map((label, i) => (
          <a key={label} href={NAV_HREFS[i]} onClick={() => setMenuOpen(false)} className="text-[32px] font-medium text-black">
            {label}
          </a>
        ))}
        <div className="flex gap-6 text-[20px] text-black">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} {...external(s.href)} className="underline underline-offset-2">
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* HERO FOREGROUND */}
      <section className="relative z-[3] h-screen min-h-[560px]" style={{ touchAction: 'pan-y' }}>
        <div
          ref={heroRef}
          className="absolute inset-x-0 bottom-0 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end px-5 sm:px-8 md:px-14 pb-6 sm:pb-9 will-change-transform"
        >
          {/* left: role, paragraph, socials */}
          <div className="order-2 sm:order-1">
            <div className="reveal flex items-center gap-3 mb-3 lg:mb-4 text-black" style={delay(0.2)}>
              <span className="block w-10 sm:w-14 h-px bg-black" />
              <span className="text-[12px] sm:text-[14px] uppercase tracking-wide">{t.role}</span>
            </div>

            <div
              className="reveal hidden lg:block relative border-l-[3px] border-[var(--accent)] pl-5 max-w-[360px] mb-6 text-black"
              style={delay(0.4)}
            >
              <p className="opacity-0" style={bodyStyle}>{t.body}</p>
              <p aria-hidden="true" className="absolute top-0 left-5 right-0" style={bodyStyle}>
                {displayed}
                {!done && (
                  <span
                    className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px]"
                    style={{ animation: 'blink 1s step-end infinite' }}
                  />
                )}
              </p>
            </div>

            <div className="reveal flex items-center gap-4 text-black" style={delay(0.7)}>
              {SOCIALS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-4">
                  {i > 0 && <span className="block h-5 w-px bg-black/30" />}
                  <a href={s.href} aria-label={s.label} {...external(s.href)} className="hover:text-[var(--accent)] transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* right: buttons */}
          <div className="reveal order-1 sm:order-2 flex flex-wrap sm:flex-col gap-3" style={delay(0.55)}>
            <a
              href="#projets"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-black text-white text-[14px] sm:text-[16px] px-6 sm:px-8 py-3 sm:py-4 sm:min-w-[280px] hover:bg-[var(--accent)] transition-colors duration-200"
            >
              {t.projects}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              href="/cv.pdf"
              download
              className="inline-flex items-center justify-center gap-3 rounded-full border border-black/70 bg-white/50 backdrop-blur-sm text-black text-[14px] sm:text-[16px] px-5 sm:px-7 py-3 sm:py-4 sm:min-w-[280px] hover:bg-black hover:text-white transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {t.cv}
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT: slides up over the fixed stage as you scroll */}
      <About lang={lang} />

      {/* PROJECTS: a 3D book that opens as you scroll */}
      <Projects lang={lang} />
    </>
  );
}
