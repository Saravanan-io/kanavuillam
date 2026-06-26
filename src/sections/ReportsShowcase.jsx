import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Box, Compass, Coins, Shield, Ruler, Cpu, Zap, Play, Sparkles, User, Calendar, ShieldCheck } from 'lucide-react';
import './ReportsShowcase.css';

const REPORTS = [
  { id: 'rpt-3d',         title: '3D View',          icon: Box,     color: '#00b4d8', pages: 12, status: 'Complete', preview: 'Floor plans, 3D renders, interior views', highlight: 'Photorealistic renders', image: '/3d_view_preview.png' },
  { id: 'rpt-vastu',      title: 'Vastu Report',      icon: Compass, color: '#6366F1', pages: 18, status: 'Complete', preview: 'Direction analysis, zone compliance',    highlight: '68/100 compliance score', image: '/vastu_report_preview.png' },
  { id: 'rpt-cost',       title: 'Cost Estimation',   icon: Coins,   color: '#10B981', pages: 24, status: 'Complete', preview: 'Item-wise breakdown, market rates',     highlight: 'Total ₹20.05L', image: '/cost_estimation_preview.png' },
  { id: 'rpt-structural', title: 'Structural Report', icon: Shield,  color: '#EF4444', pages: 32, status: 'Complete', preview: 'Engineering calcs, IS standards',       highlight: 'Grade A+ certified', image: '/structural_report_preview.png' },
  { id: 'rpt-elevation',  title: 'Elevation Design',  icon: Ruler,   color: '#8B5CF6', pages: 16, status: 'Complete', preview: 'Front, side, rear, section views',       highlight: 'AutoCAD DWG included', image: '/elevation_design_preview.png' },
];

const TRUST_BADGES = [
  { icon: Cpu,      label: 'Precision Accuracy' },
  { icon: Zap,      label: 'Real-time Results' },
  { icon: Play,     label: 'Interactive 3D Experience' },
  { icon: Sparkles, label: 'Smart & Easy Process' },
];

export default function ReportsShowcase() {
  const sectionRef   = useRef(null);
  const spotlightRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Spotlight sweep
    const spotlightAnim = gsap.to(spotlightRef.current, {
      x: '100%', duration: 7, repeat: -1, ease: 'power1.inOut', yoyo: true,
    });

    // CTA pulse
    const ctaPulseAnim = gsap.to('.rsc-cta-btn', {
      boxShadow: '0 0 70px rgba(99,102,241,0.7), 0 0 0 0 rgba(99,102,241,0)',
      duration: 1.8, yoyo: true, repeat: -1, ease: 'power2.inOut',
    });

    // Stars twinkle
    const starsAnim = gsap.to('.rsc-star', {
      opacity: () => Math.random(),
      scale: () => 0.5 + Math.random() * 1,
      duration: () => 1.5 + Math.random() * 2,
      repeat: -1, yoyo: true, stagger: { each: 0.1, from: 'random' },
    });

    // Pinned Multi-stage scroll sequence
    const grid = document.querySelector('.rsc-grid');
    const cards = document.querySelectorAll('.rsc-card');
    
    const getScrollAmount = () => {
      return grid.scrollWidth - window.innerWidth;
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=140%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });

    // Set initial active states for first card
    gsap.set(cards[0], { scale: 1.05, rotateY: 0, opacity: 1, z: 60 });

    // Phase 1: Intro exits + grid enters (t=0 to 1.2)
    tl.to('.rsc-intro-wrap',
      { autoAlpha: 0, y: -50, scale: 0.92, duration: 1.0, ease: 'power2.in' },
      0
    );
    tl.fromTo('.rsc-grid',
      { autoAlpha: 0, y: 80 },
      { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power2.out' },
      0.2
    );

    // Phase 2: Horizontal Card Slide (t=1.2 to 6.2)
    tl.to('.rsc-grid', {
      x: () => -getScrollAmount(),
      ease: 'none',
      duration: 5
    }, 1.2);

    // 3D Coverflow rotation/scaling for each card during the slide
    const totalCards = cards.length;
    cards.forEach((card, idx) => {
      const peak = 1.2 + 5.0 * (idx / (totalCards - 1));
      
      // If it is not the first card, animate it from inactive (left-angled) to active (straight)
      if (idx > 0) {
        tl.fromTo(card,
          { scale: 0.82, rotateY: -35, opacity: 0.4, z: -50 },
          { scale: 1.05, rotateY: 0, opacity: 1, z: 60, duration: 1.0, ease: 'sine.inOut' },
          peak - 1.0
        );
      }
      
      // If it is not the last card, animate it from active (straight) to inactive (right-angled)
      if (idx < totalCards - 1) {
        tl.to(card,
          { scale: 0.82, rotateY: 35, opacity: 0.4, z: -50, duration: 1.0, ease: 'sine.inOut' },
          peak
        );
      }
    });

    // Phase 3: Transition to Outro (t=6.2 to 8.0)
    tl.to('.rsc-grid',
      { autoAlpha: 0, y: -60, duration: 1.2, ease: 'power2.in' },
      6.2
    );
    
    tl.fromTo('.rsc-outro-wrap',
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power2.out' },
      6.4
    );

    // 3D tilt hover (active on mouse movement)
    cards.forEach((card) => {
      const onMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        const y = (e.clientY - rect.top  - rect.height / 2) / rect.height;
        gsap.to(card, {
          rotateY: x * 14, rotateX: -y * 14,
          duration: 0.4, ease: 'power2.out', transformPerspective: 700,
        });
      };
      
      const onMouseLeave = () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      };

      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);

      card._cleanupEvents = () => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      };
    });

    // High performance visibility trigger
    const visibilityTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        spotlightAnim.play();
        ctaPulseAnim.play();
        starsAnim.play();
      },
      onLeave: () => {
        spotlightAnim.pause();
        ctaPulseAnim.pause();
        starsAnim.pause();
      },
      onEnterBack: () => {
        spotlightAnim.play();
        ctaPulseAnim.play();
        starsAnim.play();
      },
      onLeaveBack: () => {
        spotlightAnim.pause();
        ctaPulseAnim.pause();
        starsAnim.pause();
      }
    });

    return () => {
      cards.forEach(card => card._cleanupEvents?.());
      visibilityTrigger.kill();
    };
  }, { scope: sectionRef });

  return (
    <div className="rsc-section" ref={sectionRef}>
      {/* Spotlight */}
      <div className="rsc-spotlight-wrap">
        <div className="rsc-spotlight" ref={spotlightRef} />
      </div>

      {/* Ambient stars */}
      <div className="rsc-stars" aria-hidden="true">
        {Array.from({ length: 55 }).map((_, i) => (
          <div key={i} className="rsc-star" style={{
            left: `${Math.random()*100}%`,
            top: `${Math.random()*100}%`,
            width: `${1+Math.random()*2.5}px`,
            height: `${1+Math.random()*2.5}px`,
          }} />
        ))}
      </div>

      <div className="rsc-inner">
        {/* Intro Wrapper (Title + Stats) */}
        <div className="rsc-intro-wrap">
          {/* Title */}
          <div className="rsc-title">
            <p className="section-label">Complete Documentation</p>
            <h2 className="section-title">All Reports Showcase</h2>
            <p className="section-subtitle">
              Every document professionally formatted, engineer-certified, and delivered instantly — your complete home-building dossier in one place.
            </p>
          </div>

          {/* Stats row */}
          <div className="rsc-stats">
            {[
              { val: '5',    label: 'Premium Reports' },
              { val: '102+', label: 'Total Pages' },
              { val: 'PDF',  label: 'Export Format' },
              { val: '100%', label: 'Verified & Certified' },
            ].map((s, i) => (
              <div key={i} className="rsc-stat">
                <span className="rsc-stat-val">{s.val}</span>
                <span className="rsc-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outro Wrapper (CTA + Trust + Footer) */}
        <div className="rsc-outro-wrap">
          {/* Final CTA */}
          <div className="rsc-final-cta">
            <div className="rsc-cta-badge">Ready to Build Your Kanavu illam?</div>
            <h2 className="rsc-cta-title">We Make It Simple,<br/>Fast &amp; Perfect.</h2>
            <p className="rsc-cta-sub">Everything you need to break ground on your dream home — in one comprehensive package.</p>
            <div className="rsc-cta-btns">
              <button className="btn-gold rsc-cta-btn" id="start-journey-cta">Start Your Journey →</button>
              <button className="btn-ghost" id="share-reports-btn">Share with Contractor</button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="rsc-trust">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="rsc-trust-badge">
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)' }}>
                  <b.icon size={14} strokeWidth={2} />
                </span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Footer line */}
          <div className="rsc-footer" style={{ flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
            <p style={{ opacity: 0.5, fontSize: '0.65rem', marginTop: '0.2rem' }}>© 2026 PlanX. All rights reserved. Designed with passion for architectural perfection.</p>
          </div>
        </div>
      </div>

      {/* Report cards slider - placed outside .rsc-inner to prevent container stretching */}
      <div className="rsc-grid">
        {REPORTS.map((r) => (
          <div key={r.id} id={r.id} className="rsc-card" style={{ '--card-color': r.color }}>
            {/* Holographic glow border */}
            <div className="rsc-holo-border" />
            <div className="rsc-card-glow" />
            {/* Spotlight top */}
            <div className="rsc-card-spotlight" />

            <div className="rsc-card-header">
              <div className="rsc-card-icon-wrap" style={{ background: `${r.color}18`, border: `1.5px solid ${r.color}30` }}>
                <span className="rsc-card-icon" style={{ color: r.color, display: 'flex', alignItems: 'center' }}>
                  <r.icon size={22} strokeWidth={1.5} />
                </span>
              </div>
              <div className="rsc-card-meta">
                <span className="rsc-card-pages">{r.pages} pages</span>
                <span className="rsc-card-status" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} style={{ color: '#10B981' }} /> {r.status}
                </span>
              </div>
            </div>

            {r.image && (
              <div className="rsc-card-img-wrap">
                <img src={r.image} alt={r.title} className="rsc-card-img" />
              </div>
            )}

            <h3 className="rsc-card-title">{r.title}</h3>
            <p className="rsc-card-preview">{r.preview}</p>

            <div className="rsc-card-highlight" style={{ borderColor: `${r.color}40`, color: r.color }}>
              ✦ {r.highlight}
            </div>

            <div className="rsc-card-footer">
              <span className="rsc-card-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Jun 2026
              </span>
              <button className="rsc-card-btn" style={{ color: r.color, borderColor: `${r.color}40` }}>
                Download →
              </button>
            </div>

            <div className="rsc-card-line" style={{ background: `linear-gradient(90deg, ${r.color}, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
