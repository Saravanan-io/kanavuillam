import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Box, Compass, IndianRupee, Landmark, Ruler } from 'lucide-react';
import './FeatureCards.css';

const splitText = (text) => {
  return text.split(' ').map((word, wIdx, arr) => (
    <span key={wIdx} className="word" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
      {word.split('').map((char, cIdx) => (
        <span key={cIdx} className="char" style={{ display: 'inline-block' }}>
          {char}
        </span>
      ))}
      {wIdx < arr.length - 1 && <span className="space" style={{ display: 'inline-block' }}>&nbsp;</span>}
    </span>
  ));
};

const FEATURES = [
  {
    id: 'feat-3d',
    icon: Box,
    title: '3D View',
    desc: 'Explore your home in interactive 3D with photorealistic rendering.',
    color: '#4F46E5',
    tag: 'Interactive',
    num: '01',
  },
  {
    id: 'feat-vastu',
    icon: Compass,
    title: 'Vastu Report',
    desc: 'Comprehensive Vastu Shastra analysis for perfect home harmony.',
    color: '#0D9488',
    tag: 'Harmony',
    num: '02',
  },
  {
    id: 'feat-cost',
    icon: IndianRupee,
    title: 'Cost Estimation',
    desc: 'Real-time material & cost calculation with zero hidden costs.',
    color: '#2563EB',
    tag: 'Budget',
    num: '03',
  },
  {
    id: 'feat-structural',
    icon: Landmark,
    title: 'Structural Report',
    desc: 'Detailed structural analysis & external views certified by engineers.',
    color: '#059669',
    tag: 'Safety',
    num: '04',
  },
  {
    id: 'feat-elevation',
    icon: Ruler,
    title: 'Elevation Design',
    desc: 'Stunning elevation designs & external views with facade details.',
    color: '#7C3AED',
    tag: 'Design',
    num: '05',
  },
];

export default function FeatureCards() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);
  const cardsRef = useRef([]);
  const canvasRef = useRef(null);

  /* ── Floating particles canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    let animId;

    const pts = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 20,
      r: 1 + Math.random() * 2,
      vy: -(0.2 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 0.3,
      a: 0.1 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.phase += 0.018;
        const a = p.a * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,70,229,${a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(render);
    };

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) render();
      else cancelAnimationFrame(animId);
    }, { threshold: 0.1 });
    obs.observe(sectionRef.current);
    return () => { cancelAnimationFrame(animId); obs.disconnect(); };
  }, []);

  /* ── Cinematic Scroll sequence ── */
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const grid = gridRef.current;
    const cards = cardsRef.current.filter(Boolean);

    const getTranslation = (idx) => {
      const W = section.offsetWidth;
      const card = cards[idx];
      if (!card) return 0;
      const center = card.offsetLeft + card.offsetWidth / 2;
      return W / 2 - center;
    };

    /* Set initial hidden state for cards and title elements to avoid flashes */
    gsap.set(grid, { autoAlpha: 0, y: 250, x: () => getTranslation(0) });
    gsap.set(cards, { scale: 0.75, rotateY: -45, opacity: 0, z: -80 });
    gsap.set(cards[0], { scale: 1.05, rotateY: 0, opacity: 1, z: 60 });

    gsap.set(titleRef.current.querySelectorAll('.char'), { opacity: 0, y: 40 });
    gsap.set(titleRef.current.querySelector('.gradient-line'), { scaleX: 0, opacity: 0 });
    gsap.set(titleRef.current.querySelector('.fc-scroll-hint'), { y: 20, opacity: 0 });
    gsap.set('.fc-dot', { opacity: 0, x: 20, scale: 0.5 });

    /* Entrance animation triggered on scroll-enter (runs automatically for maximum smoothness) */
    const entryTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      onEnter: () => {
        // Kill any ongoing animation on these elements to prevent overlap
        gsap.killTweensOf(titleRef.current.querySelectorAll('.char, .gradient-line, .fc-scroll-hint, .fc-dot'));

        const timeline = gsap.timeline();

        timeline.fromTo(titleRef.current.querySelectorAll('.section-label .char'),
          { y: 35, opacity: 0, scale: 0.7, rotateX: -70, transformOrigin: '50% 100% -10px' },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, stagger: 0.015, duration: 0.9, ease: 'power3.out' }
        );

        timeline.fromTo(titleRef.current.querySelectorAll('.section-title .char'),
          { y: 50, opacity: 0, scale: 0.6, rotateX: -80, transformOrigin: '50% 100% -20px' },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, stagger: 0.008, duration: 1.1, ease: 'back.out(1.2)' },
          '-=0.65'
        );

        timeline.fromTo(titleRef.current.querySelectorAll('.section-subtitle .char'),
          { y: 20, opacity: 0, scale: 0.85, rotateX: -30, transformOrigin: '50% 100%' },
          { y: 0, opacity: 0.85, scale: 1, rotateX: 0, stagger: 0.003, duration: 0.8, ease: 'power3.out' },
          '-=0.75'
        );

        timeline.fromTo(titleRef.current.querySelector('.gradient-line'),
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.45, duration: 0.8, ease: 'power3.out' },
          '-=0.5'
        );

        timeline.fromTo(titleRef.current.querySelector('.fc-scroll-hint'),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 0.7, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        );

        timeline.fromTo('.fc-dot',
          { opacity: 0, x: 20, scale: 0.5 },
          { opacity: 1, x: 0, scale: 1, stagger: 0.05, duration: 0.6, ease: 'back.out(1.5)' },
          '-=0.5'
        );
      },
      onLeaveBack: () => {
        // Reset state so it animates again when scrolling down
        gsap.to(titleRef.current.querySelectorAll('.char'), { opacity: 0, y: 35, duration: 0.4, overwrite: 'auto' });
        gsap.to(titleRef.current.querySelector('.gradient-line'), { scaleX: 0, opacity: 0, duration: 0.4, overwrite: 'auto' });
        gsap.to(titleRef.current.querySelector('.fc-scroll-hint'), { y: 20, opacity: 0, duration: 0.4, overwrite: 'auto' });
        gsap.to('.fc-dot', { opacity: 0, x: 20, scale: 0.6, duration: 0.4, overwrite: 'auto' });
      }
    });

    /* Master cinematic timeline — pinned to section */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    /* Phase 1: Title exits + grid flies in (t 0→1.6) */
    tl.to(titleRef.current,
      { autoAlpha: 0, y: -180, scale: 0.88, duration: 0.5, ease: 'power2.in' },
      0
    );
    tl.to(grid,
      { autoAlpha: 1, y: 0, x: () => getTranslation(0), duration: 1.0, ease: 'power3.out' },
      0.6
    );

    /* Phase 2: Horizontal coverflow slide (t 1.2→6.2) */
    tl.to(grid,
      { x: () => getTranslation(cards.length - 1), ease: 'none', duration: 5 },
      1.2
    );

    /* 3D coverflow per card */
    const total = cards.length;
    cards.forEach((card, idx) => {
      const peak = 1.2 + 5 * (idx / (total - 1));

      if (idx > 0) {
        tl.fromTo(card,
          { scale: 0.78, rotateY: -42, opacity: 0.35, z: -70 },
          {
            scale: 1.06, rotateY: 0, opacity: 1, z: 65,
            duration: 1.0, ease: 'sine.inOut'
          },
          peak - 1.0
        );
      }
      if (idx < total - 1) {
        tl.to(card,
          {
            scale: 0.78, rotateY: 42, opacity: 0.35, z: -70,
            duration: 1.0, ease: 'sine.inOut'
          },
          peak
        );
      }
    });

    /* Phase 3: Grid fades out + outro text (t 6.2→8) */
    tl.to(grid,
      { autoAlpha: 0, y: -60, duration: 1.2, ease: 'power2.in' },
      6.2
    );
    tl.fromTo('.fc-outro',
      { autoAlpha: 0, y: 50, scale: 0.95 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' },
      6.4
    );
    tl.fromTo('.fc-outro .char',
      { y: 30, opacity: 0, scale: 0.6 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.015, duration: 1.2, ease: 'back.out(1.2)' },
      6.4
    );

    /* Depth bar progress — track active card */
    const dotEls = document.querySelectorAll('.fc-dot');
    const cardWidth = () => grid.scrollWidth / total;
    const progressTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=220%',
      onUpdate: (self) => {
        const progress = self.progress;
        // map scroll progress → active card index during slide phase (1.2–6.2 out of 8 total)
        const slideStart = 1.2 / 8;
        const slideEnd = 6.2 / 8;
        const slideProgress = Math.max(0, Math.min(1, (progress - slideStart) / (slideEnd - slideStart)));
        const activeIdx = Math.round(slideProgress * (total - 1));
        dotEls.forEach((dot, i) => {
          dot.classList.toggle('fc-dot--active', i === activeIdx);
        });
      },
    });

    /* 3D hover tilt */
    const cleanups = [];
    cards.forEach((card) => {
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        gsap.to(card, {
          rotateY: x * 14, rotateX: -y * 14,
          transformPerspective: 700, duration: 0.4, ease: 'power2.out'
        });
      };
      const onLeave = () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' });
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      entryTrigger.kill();
      tl.kill();
      progressTrigger.kill();
      cleanups.forEach(fn => fn());
    };
  }, { scope: sectionRef });

  return (
    <div className="fc-section" ref={sectionRef}>
      {/* BG */}
      <div className="fc-bg">
        <div className="fc-bg-grid" />
        <div className="fc-bg-glow" />
        {/* Cinematic vignette */}
        <div className="fc-vignette" />
      </div>
      <canvas className="fc-canvas" ref={canvasRef} />

      {/* Progress dots */}
      <div className="fc-dots" aria-hidden="true">
        {FEATURES.map((_, i) => (
          <div key={i} className={`fc-dot${i === 0 ? ' fc-dot--active' : ''}`} />
        ))}
      </div>

      <div className="fc-inner">
        {/* Title section */}
        <div className="fc-title-wrap" ref={titleRef}>
          <p className="section-label">{splitText("Our Specialized Services")}</p>
          <h2 className="section-title">
            {splitText("Everything You Need to Build")}
            <br />
            {splitText("Your Dream Home")}
          </h2>
          <p className="section-subtitle">
            {splitText("Five powerful modules that transform your vision into a breathtaking reality — all in one seamless experience.")}
          </p>
          <div className="gradient-line" />
          {/* Scroll hint */}
          <div className="fc-scroll-hint">
            <span className="fc-scroll-text">{splitText("Scroll to explore")}</span>
            <span className="fc-scroll-chevrons">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>

        {/* Outro (appears after cards) */}
        <div className="fc-outro" aria-hidden="false">
          <p className="section-label">{splitText("Seamlessly Integrated")}</p>
          <h2 className="section-title">
            {splitText("Five Modules.")}
            <br />
            {splitText("One Dream Home.")}
          </h2>
          <p className="section-subtitle">{splitText("Every feature works together to deliver your perfect home experience.")}</p>
        </div>
      </div>

      {/* Cards slider — outside fc-inner to avoid clip */}
      <div className="fc-grid" ref={gridRef} style={{ perspective: '1200px' }}>
        {FEATURES.map((f, i) => (
          <div
            id={f.id}
            key={f.id}
            className="fc-card"
            ref={el => cardsRef.current[i] = el}
            style={{ '--accent': f.color }}
          >
            {/* Holographic border */}
            <div className="fc-holo-border" />
            {/* Glow burst */}
            <div className="fc-card-glow" />
            {/* Shimmer sweep */}
            <div className="fc-shimmer" />
            {/* Depth light */}
            <div className="fc-card-light" />

            <div className="fc-card-top">
              <div className="fc-icon-wrap" style={{ color: f.color, background: `${f.color}14`, border: `1.5px solid ${f.color}30` }}>
                <span className="fc-icon">
                  <f.icon size={22} strokeWidth={2} />
                </span>
              </div>
              <span className="fc-num">{f.num}</span>
            </div>

            <h3 className="fc-card-title">{f.title}</h3>
            <p className="fc-card-desc">{f.desc}</p>

            <div className="fc-card-footer">
              <span className="fc-tag" style={{ color: f.color, borderColor: `${f.color}40` }}>
                {f.tag}
              </span>
              <span className="fc-arrow">→</span>
            </div>

            {/* Bottom accent line */}
            <div className="fc-card-line" style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
