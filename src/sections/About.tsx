import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

export type Lang = 'fr' | 'en';

const EMAIL = 'adododjialban@gmail.com';

// Compétences affichées dans le bandeau défilant.
// Pour en ajouter : copie le logo dans public/logos/ puis ajoute une ligne ici.
const SKILLS = [
  { short: 'Re', name: 'React', logo: '/logos/react.svg' },
  { short: 'Fl', name: 'Flutter', logo: '/logos/flutter.svg' },
  { short: 'La', name: 'Laravel', logo: '/logos/laravel.svg' },
  { short: 'Py', name: 'Python', logo: '/logos/python.svg' },
  // { short: 'TS', name: 'TypeScript', logo: '/logos/typescript.svg' },
  // { short: 'Tw', name: 'Tailwind CSS', logo: '/logos/tailwindcss.svg' },
];

// Répété pour que le bandeau remplisse même les très grands écrans
const MARQUEE_ITEMS = Array.from({ length: 4 }).flatMap(() => SKILLS);

// TODO: remplace par ton vrai parcours
const TIMELINE = [
  {
    year: '20XX',
    fr: ['Ta formation', 'Décris ici ton diplôme ou ta formation.'],
    en: ['Your education', 'Describe your degree or training here.'],
  },
  {
    year: '20XX',
    fr: ['Ta première expérience', 'Décris ici une mission, un stage ou un projet marquant.'],
    en: ['Your first experience', 'Describe a mission, internship or key project here.'],
  },
  {
    year: '20XX',
    fr: ['Aujourd’hui', 'Développeur full-stack : conception, développement et mise en ligne.'],
    en: ['Today', 'Full-stack developer: design, development and deployment.'],
  },
];

const T = {
  fr: {
    back: 'Retour',
    tag: 'À propos de moi',
    h1a: 'Derrière chaque projet, ',
    h1b: 'une vraie envie de construire',
    bio1: 'Je suis Kokou Arnold ADODODJI, développeur full-stack. Je conçois et développe des applications web et mobiles, du design des interfaces jusqu’à la mise en production.',
    bio2: 'J’aime le code lisible, les interfaces soignées et les solutions qui répondent à de vrais besoins.',
    badge1: 'Full-Stack',
    badge2: 'React · Flutter · Laravel · Python',
    stackTitle: 'Ma stack',
    stackHint: 'Survole pour mettre en pause',
    pathTitle: 'Mon parcours',
    ctaTitle: 'Un projet en tête ?',
    ctaText: 'Parlons-en.',
    cta: 'Me contacter',
    home: 'Retour à l’accueil',
    switchTo: 'Switch to English',
  },
  en: {
    back: 'Back',
    tag: 'About me',
    h1a: 'Behind every project, ',
    h1b: 'a real drive to build',
    bio1: 'I’m Kokou Arnold ADODODJI, a full-stack developer. I design and build web and mobile applications, from interface design all the way to production.',
    bio2: 'I like readable code, polished interfaces and solutions that answer real needs.',
    badge1: 'Full-Stack',
    badge2: 'React · Flutter · Laravel · Python',
    stackTitle: 'My stack',
    stackHint: 'Hover to pause',
    pathTitle: 'My journey',
    ctaTitle: 'Got a project in mind?',
    ctaText: 'Let’s talk.',
    cta: 'Get in touch',
    home: 'Back to home',
    switchTo: 'Passer en français',
  },
} as const;

/* ---------- helpers ---------- */
function useInView<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`sr ${shown ? 'show' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* 3D tilt card that follows the mouse */
function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };
  return (
    <div style={{ perspective: '1100px' }} onMouseMove={move} onMouseLeave={reset}>
      <div ref={ref} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out' }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function About({ lang }: { lang: Lang }) {
  const t = T[lang];

  return (
    <div id="about" className="relative z-[5] bg-[#f4f2ee] text-black overflow-x-hidden rounded-t-[40px] shadow-[0_-30px_60px_rgba(0,0,0,0.12)]">
      {/* intro */}
      <section className="grid md:grid-cols-2 gap-14 items-center max-w-[1280px] mx-auto px-5 sm:px-8 md:px-14 pt-24 md:pt-28 pb-20 min-h-screen">
        <div>
          <Reveal className="flex items-center gap-4 mb-6">
            <span className="block w-14 h-px bg-black" />
            <span className="text-[14px] sm:text-[16px] uppercase">{t.tag}</span>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="mb-8" style={{ fontSize: 'clamp(34px, 5.4vw, 50px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              {t.h1a}
              <span className="heavy">{t.h1b}</span>
              <span className="text-[var(--accent)]">.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.25} className="border-l-[3px] border-[var(--accent)] pl-5 max-w-[560px] space-y-4">
            <div style={{ fontSize: 'clamp(16px, 1.7vw, 20px)', lineHeight: 1.5 }} className="space-y-4">
              <p>{t.bio1}</p>
              <p>{t.bio2}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="flex justify-center">
          <TiltCard>
            <div className="relative w-[min(78vw,380px)] aspect-[4/5]">
              <div
                className="absolute inset-0 rounded-[28px] border-2 border-[var(--accent)]"
                style={{ transform: 'translateZ(-50px) translate(20px, 20px)' }}
              />
              <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-neutral-300 shadow-2xl">
                <img src="/portrait.jpg" alt="Arnold Adododji" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -left-5 bottom-10" style={{ transform: 'translateZ(80px)' }}>
                <span className="floaty block rounded-full bg-black text-white px-5 py-2 text-[10px]">{t.badge1}</span>
              </div>
              <div className="absolute -right-4 top-10" style={{ transform: 'translateZ(60px)' }}>
                <span className="floaty block rounded-2xl bg-white shadow-lg px-4 py-2 text-[14px]" style={{ animationDelay: '1.2s' }}>
                  {t.badge2}
                </span>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </section>

      {/* skills marquee */}
      <section id="competences" className="scroll-mt-16 pb-24">
        <Reveal className="max-w-[1280px] mx-auto px-5 sm:px-8 md:px-14 mb-8 flex items-center gap-4">
          <span className="block w-14 h-px bg-black" />
          <span className="text-[14px] sm:text-[16px] uppercase">{t.stackTitle}</span>
        </Reveal>

        <div className="marquee border-y border-black/10 py-6 sm:py-8" role="region" aria-label={t.stackTitle}>
          <div className="marquee-track">
            {[0, 1].map((half) => (
              <ul key={half} aria-hidden={half === 1} className="flex shrink-0 gap-4 sm:gap-5 pr-4 sm:pr-5">
                {MARQUEE_ITEMS.map((s, i) => (
                  <li
                    key={`${s.name}-${i}`}
                    className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white px-6 sm:px-7 py-4 sm:py-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <img
                      src={s.logo}
                      alt=""
                      width={36}
                      height={36}
                      draggable={false}
                      className="h-8 w-8 sm:h-9 sm:w-9 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="text-[16px] sm:text-[19px] whitespace-nowrap">{s.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] opacity-50 hidden md:block">{t.stackHint}</p>
      </section>

      {/* 3D stack ring */}
      {/* <section id="competences" className="scroll-mt-16 py-20 overflow-hidden">
        <Reveal className="text-center mb-8">
          <h2 className="heavy" style={{ fontSize: 'clamp(30px, 4.5vw, 56px)', letterSpacing: '-0.02em' }}>
            {t.stackTitle}<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="mt-2 text-[14px] opacity-60">{t.stackHint}</p>
        </Reveal>
        <div style={{ perspective: '1100px' }} className="h-[320px] flex items-center justify-center">
          <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-12deg)' }}>
            <div className="ring relative w-[130px] h-[170px]">
              {SKILLS.map((s, i) => (
                <div
                  key={s.name}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-black/10 shadow-xl"
                  style={{ transform: `rotateY(${i * (360 / SKILLS.length)}deg) translateZ(165px)`, backfaceVisibility: 'hidden' }}
                >
                  <span className="heavy text-[40px] text-[var(--accent)]">{s.short}</span>
                  <span className="text-[15px]">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* timeline */}
      {/* <section id="parcours" className="scroll-mt-16 max-w-[760px] mx-auto px-5 sm:px-8 py-24">
        <Reveal className="mb-12">
          <h2 className="heavy" style={{ fontSize: 'clamp(30px, 4.5vw, 56px)', letterSpacing: '-0.02em' }}>
            {t.pathTitle}<span className="text-[var(--accent)]">.</span>
          </h2>
        </Reveal>
        <div className="border-l-2 border-black/15 ml-2">
          {TIMELINE.map((item, i) => (
            <Reveal key={i} delay={i * 0.1} className="relative pl-8 pb-12 last:pb-0">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--accent)] ring-4 ring-[#f4f2ee]" />
              <div className="text-[14px] text-[var(--accent)]">{item.year}</div>
              <div className="heavy text-[22px] sm:text-[26px] mt-1">{item[lang][0]}</div>
              <p className="mt-2 opacity-75 max-w-[520px]">{item[lang][1]}</p>
            </Reveal>
          ))}
        </div>
      </section> */}

      {/* call to action */}
      {/* <section className="px-5 sm:px-8 pb-24">
        <Reveal className="max-w-[1100px] mx-auto rounded-[32px] bg-black text-white px-8 sm:px-14 py-14 sm:py-20 text-center">
          <h2 className="heavy" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', letterSpacing: '-0.02em' }}>
            {t.ctaTitle} <span className="text-[var(--accent)]">{t.ctaText}</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-full bg-[var(--accent)] text-black px-8 py-4 text-[16px] hover:bg-white transition-colors duration-200"
            >
              {t.cta}
            </a>
            <a
              href="#"
              className="rounded-full border border-white/60 px-8 py-4 text-[16px] hover:bg-white hover:text-black transition-colors duration-200"
            >
              {t.home}
            </a>
          </div>
        </Reveal>
      </section> */}
    </div>
  );
}
