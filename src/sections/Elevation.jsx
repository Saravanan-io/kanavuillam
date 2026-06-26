import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MoveHorizontal,
  MoveVertical,
  CornerUpRight,
  Ruler,
  Download,
  Smartphone,
  Sparkles,
  PenTool,
  Building,
  Grid,
  Layers,
  Hammer,
  Home
} from 'lucide-react';
import BirdFlock from '../components/BirdFlock';
import './Elevation.css';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { label: 'The Spark', icon: Sparkles, desc: 'Golden energy beam strikes' },
  { label: 'The Blueprint', icon: PenTool, desc: 'Glowing wireframes drawn' },
  { label: 'The Foundation', icon: Building, desc: 'Stone plinth and footer' },
  { label: 'Skeletal Frame', icon: Grid, desc: 'Concrete pillars and slabs' },
  { label: 'Walls & Rooms', icon: Layers, desc: 'Brickwork and wood cladding' },
  { label: 'Roof & Textures', icon: Hammer, desc: 'Glazing, door, and planters' },
  { label: 'Home Complete', icon: Home, desc: 'Warm lights and landscape' },
];

const MATERIALS = [
  { name: 'Premium Slate', usage: 'Plinth Foundation', swatch: '#374151' },
  { name: 'Teak Wood Siding', usage: 'Accent Wall Cladding', swatch: '#a16244' },
  { name: 'White Stucco', usage: 'Main Exterior Finish', swatch: '#f8fafc' },
  { name: 'Reflective Glazing', usage: 'Thermal Windows', swatch: '#a5f3fc' },
];

export default function Elevation() {
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const activeStepRef = useRef(0);

  const getActiveStep = (prog) => {
    if (prog < 0.12) return 0;
    if (prog < 0.25) return 1;
    if (prog < 0.40) return 2;
    if (prog < 0.55) return 3;
    if (prog < 0.70) return 4;
    if (prog < 0.85) return 5;
    return 6;
  };

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Math.random() * 3 + 0.8;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = type === 'spark' ? -Math.random() * 4 - 2 : -Math.random() * 1.5 - 0.5;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        if (type === 'spark') {
          this.color = `rgba(255, 190, 50, ${this.alpha})`;
        } else if (type === 'blueprint') {
          this.color = `rgba(0, 210, 255, ${this.alpha})`;
        } else if (type === 'dust') {
          this.color = `rgba(180, 180, 180, ${this.alpha})`;
        } else {
          this.color = `rgba(255, 230, 160, ${this.alpha})`;
        }
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let particles = [];
    let running = false;

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const prog = progressRef.current;

      if (prog > 0 && prog < 0.12) {
        if (Math.random() < 0.5) {
          particles.push(new Particle(canvas.width * 0.5 + (Math.random() - 0.5) * 60, canvas.height * 0.65, 'spark'));
        }
      } else if (prog >= 0.12 && prog < 0.25) {
        if (Math.random() < 0.3) {
          particles.push(new Particle(Math.random() * canvas.width, canvas.height * (0.3 + Math.random() * 0.4), 'blueprint'));
        }
      } else if (prog >= 0.25 && prog < 0.55) {
        if (Math.random() < 0.4) {
          particles.push(new Particle(canvas.width * (0.28 + Math.random() * 0.55), canvas.height * (0.55 + Math.random() * 0.2), 'dust'));
        }
      } else if (prog >= 0.85) {
        if (Math.random() < 0.05) {
          particles.push(new Particle(Math.random() * canvas.width, canvas.height * 0.95, 'mote'));
        }
      }

      particles.forEach((p, index) => {
        p.update();
        if (p.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          p.draw(ctx);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=350%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const newStep = getActiveStep(self.progress);
          if (newStep !== activeStepRef.current) {
            activeStepRef.current = newStep;

            const line = containerRef.current.querySelector('.elev-stepper-line');
            if (line) {
              line.style.setProperty('--height', `${(newStep / (STEPS.length - 1)) * 100}%`);
            }

            const items = containerRef.current.querySelectorAll('.elev-step-item');
            items.forEach((item, idx) => {
              item.classList.toggle('active', idx === newStep);
              item.classList.toggle('completed', idx < newStep);
            });

            const overlay = containerRef.current.querySelector('.elev-viewport-overlay-text');
            const stepTexts = [
              'PREPARING PLOT',
              'SCANNING BLUEPRINT',
              'CASTING FOUNDATION',
              'LOCKING SKELETON',
              'ASSEMBLING WALLS',
              'PLACING CLADDING & ROOF',
              'FINAL VIEW'
            ];
            if (overlay) {
              overlay.textContent = stepTexts[newStep] || '';
            }

            const flock = containerRef.current.querySelector('.elev-bird-flock-wrap');
            if (flock) {
              flock.style.display = newStep === 6 ? 'block' : 'none';
            }
          }
        },
      },
    });

    // Subtly zoom the camera in during scroll build
    tl.to(viewportRef.current, { scale: 1.05, ease: 'none' }, 0);

    // Phase 0: Golden Spark Pulse & Beam
    tl.fromTo('.elev-spark-beam', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.1 }, 0)
      .fromTo('.elev-spark-ripple', { scale: 0.1, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.12, stagger: 0.05 }, 0.02)
      .to('.elev-spark-beam, .elev-spark-ripple', { opacity: 0, duration: 0.08 }, 0.1);

    // Phase 1: Blueprint lines draw
    tl.fromTo('.elev-blueprint-line',
      { strokeDashoffset: 1200 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.18, ease: 'power2.inOut' },
      0.08
    );

    // Laser scan sweep
    tl.fromTo('.elev-laser-sweep',
      { top: '15%', opacity: 0 },
      { top: '85%', opacity: 1, duration: 0.18, repeat: 1, yoyo: true, ease: 'sine.inOut' },
      0.1
    ).to('.elev-laser-sweep', { opacity: 0, duration: 0.08 }, 0.25);

    // Phase 2: Foundation (Slate plinth slab) emerges from bottom
    tl.fromTo('.house-foundation',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.15, ease: 'power2.out' },
      0.23
    );

    // Phase 3: Frame (Concrete pillars and ceiling slabs)
    tl.fromTo('.house-pillar',
      { y: 160, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.16, stagger: 0.02, ease: 'power2.out' },
      0.35
    ).fromTo('.house-slab',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, transformOrigin: 'center center', duration: 0.15, ease: 'power2.inOut' },
      0.44
    );

    // Phase 4: Walls (wood horizontal cladding, white stucco, and door frame) and Interior backdrop
    tl.fromTo('.house-interior',
      { opacity: 0 },
      { opacity: 0.9, duration: 0.15, ease: 'power2.inOut' },
      0.48
    ).fromTo('.house-wall',
      { y: 160, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.18, stagger: 0.03, ease: 'power2.out' },
      0.53
    );

    // Phase 5: Roof panels, windows, glazing, entry doors, planters
    tl.fromTo('.house-roof-slab',
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.15, ease: 'power3.out' },
      0.68
    ).fromTo('.house-window-frame, .house-door',
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, transformOrigin: 'center center', duration: 0.15, stagger: 0.02, ease: 'power2.out' },
      0.72
    ).fromTo('.house-planter',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.12, stagger: 0.04, ease: 'power2.out' },
      0.78
    );

    // Phase 6: Landscaping cypress trees grow, light fixtures, warm glows, lens flares
    tl.fromTo('.house-tree',
      { y: 120, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.18, stagger: 0.04, ease: 'power2.out' },
      0.82
    ).fromTo('.house-glass-reflection',
      { opacity: 0 },
      { opacity: 1, duration: 0.12, ease: 'power2.inOut' },
      0.85
    ).fromTo('.house-light-glow, .house-sconce-glow',
      { opacity: 0 },
      { opacity: 0.9, duration: 0.15, stagger: 0.03, ease: 'power2.out' },
      0.88
    ).fromTo('.elev-bloom-layer, .elev-lens-flare',
      { opacity: 0 },
      { opacity: 0.95, duration: 0.12, ease: 'power2.out' },
      0.90
    );

    // Fade out blueprint lines as realistic model completes
    tl.to('.elev-blueprint-line, .elev-axis-label',
      { opacity: 0, duration: 0.15 },
      0.78
    );

    const particleTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        if (!running) { running = true; render(); }
      },
      onLeave: () => {
        running = false;
        cancelAnimationFrame(animationFrameId);
      },
      onEnterBack: () => {
        if (!running) { running = true; render(); }
      },
      onLeaveBack: () => {
        running = false;
        cancelAnimationFrame(animationFrameId);
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      particleTrigger.kill();
    };
  }, { scope: containerRef, dependencies: [] });

  return (
    <div className="elev-section" ref={containerRef}>
      <div className="elev-bg">
        <div className="elev-sky" />
        <div className="elev-horizon" />
      </div>

      <div className="elev-inner">
        <div className="elev-left-col">
          <div className="elev-stepper-title">
            <span className="est-sub">Build Process</span>
            <h3 className="est-main">Scroll to Build</h3>
            <p className="est-desc">Watch the engineering architecture grow step-by-step.</p>
          </div>

          <div className="elev-stepper-list">
            <div className="elev-stepper-line" style={{ '--height': '0%' }} />
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <div key={i} className={`elev-step-item ${i === 0 ? 'active' : ''}`}>
                  <div className="esi-bubble">
                    <StepIcon size={16} />
                  </div>
                  <div className="esi-text">
                    <span className="esi-index">Phase 0{i + 1}</span>
                    <span className="esi-label">{s.label}</span>
                    <span className="esi-desc">{s.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="elev-right-col">
          <div className="elev-viewport-wrapper">
            <div className="elev-viewport" ref={viewportRef}>

              {/* Base background site */}
              <div className="elev-base-site">
                <div className="ebs-sky" />
                <div className="ebs-ground-grid" />
              </div>

              {/* Spark animations */}
              <div className="elev-spark-beam" />
              <div className="elev-spark-ripple r1" />
              <div className="elev-spark-ripple r2" />
              <div className="elev-spark-ripple r3" />

              {/* High Fidelity Vector Elevation Drawing */}
              <svg className="elev-house-svg" viewBox="0 0 1000 560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Wood Horizontal Cladding Pattern */}
                  <pattern id="wood-pattern" width="120" height="10" patternUnits="userSpaceOnUse">
                    <rect width="120" height="10" fill="#a16244"/>
                    <line x1="0" y1="10" x2="120" y2="10" stroke="#5c3a21" strokeWidth="1"/>
                    <rect width="120" height="2" fill="#b47b59" opacity="0.3"/>
                  </pattern>

                  {/* Stone Masonry Pattern */}
                  <pattern id="stone-pattern" width="40" height="20" patternUnits="userSpaceOnUse">
                    <rect width="40" height="20" fill="#374151"/>
                    <rect x="1" y="1" width="18" height="8" fill="#4b5563"/>
                    <rect x="20" y="1" width="19" height="8" fill="#1f2937"/>
                    <rect x="1" y="10" width="24" height="9" fill="#1f2937"/>
                    <rect x="26" y="10" width="13" height="9" fill="#4b5563"/>
                  </pattern>

                  {/* Concrete Ceiling Slabs Gradient */}
                  <linearGradient id="concrete-slab-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f3f4f6"/>
                    <stop offset="15%" stopColor="#d1d5db"/>
                    <stop offset="85%" stopColor="#9ca3af"/>
                    <stop offset="100%" stopColor="#4b5563"/>
                  </linearGradient>

                  {/* Concrete Pillars Gradient */}
                  <linearGradient id="concrete-pillar-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e5e7eb"/>
                    <stop offset="35%" stopColor="#d1d5db"/>
                    <stop offset="85%" stopColor="#9ca3af"/>
                    <stop offset="100%" stopColor="#6b7280"/>
                  </linearGradient>

                  {/* Glass Window Tint Gradient */}
                  <linearGradient id="glass-tint-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.45"/>
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.55"/>
                  </linearGradient>

                  {/* Glass Specular Glare Reflection */}
                  <linearGradient id="glass-reflection-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0"/>
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0"/>
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.6"/>
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0.6"/>
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </linearGradient>

                  {/* Window Glow (Interior lights on) */}
                  <radialGradient id="warm-light-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.75" />
                    <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                  </radialGradient>

                  {/* Downward Wall Sconce Cone */}
                  <linearGradient id="sconce-cone-down" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                    <stop offset="35%" stopColor="#facc15" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                  </linearGradient>

                  {/* Upward Wall Sconce Cone */}
                  <linearGradient id="sconce-cone-up" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                    <stop offset="35%" stopColor="#facc15" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                  </linearGradient>

                  {/* Soft Shadow Under Slabs */}
                  <linearGradient id="slab-shadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#090d16" stopOpacity="0.45"/>
                    <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
                  </linearGradient>

                  {/* Tree Foliage & Bark Gradients */}
                  <linearGradient id="tree-grad-1" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#0c2d1c"/>
                    <stop offset="70%" stopColor="#14532d"/>
                    <stop offset="100%" stopColor="#166534"/>
                  </linearGradient>
                  <linearGradient id="tree-grad-2" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#14532d"/>
                    <stop offset="80%" stopColor="#16a34a"/>
                    <stop offset="100%" stopColor="#4ade80"/>
                  </linearGradient>
                  <linearGradient id="bark-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#451a03"/>
                    <stop offset="50%" stopColor="#78350f"/>
                    <stop offset="100%" stopColor="#451a03"/>
                  </linearGradient>
                </defs>

                {/* Ground Grass / Stone Platform */}
                <g className="house-ground">
                  {/* Sky background inside drawing */}
                  <rect x="150" y="80" width="700" height="400" fill="#bae6fd" opacity="0.08"/>
                  {/* Grass bed */}
                  <rect x="100" y="480" width="800" height="30" fill="#15803d" opacity="0.85" rx="3"/>
                  {/* Driveway path */}
                  <polygon points="380,480 620,480 650,510 350,510" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                </g>

                {/* House Interior / Dark Backdrop (behind windows & doors) */}
                <rect className="house-interior" x="210" y="180" width="580" height="285" fill="#0f172a" opacity="0.9" rx="1"/>

                {/* Phase 4: Walls (Rendered behind pillars & slabs for depth) */}
                <g className="house-walls">
                  {/* Ground Floor Left: Warm Wood Accent wall */}
                  <rect className="house-wall" x="264" y="335" width="176" height="130" fill="url(#wood-pattern)" stroke="#451a03" strokeWidth="1.5"/>
                  {/* Ground Floor Right: Stucco wall */}
                  <rect className="house-wall" x="584" y="335" width="156" height="130" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/>
                  {/* Ground Floor Middle: Recessed Foyer wall (expanded to touch columns) */}
                  <rect className="house-wall" x="440" y="335" width="144" height="130" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1"/>

                  {/* First Floor Left: Elegant white cantilevered stucco volume */}
                  <rect className="house-wall" x="210" y="180" width="290" height="140" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" rx="1"/>
                  {/* Shadow under cantilever */}
                  <polygon className="house-wall" points="210,320 500,320 500,330 220,330" fill="url(#slab-shadow)" opacity="0.8"/>

                  {/* First Floor Right: Accent Wood Box */}
                  <rect className="house-wall" x="500" y="180" width="290" height="140" fill="url(#wood-pattern)" stroke="#451a03" strokeWidth="1" rx="1"/>
                </g>

                {/* Phase 2: Foundation Stone Base */}
                <g className="house-foundation">
                  <rect x="210" y="465" width="580" height="15" fill="url(#stone-pattern)" stroke="#1e293b" strokeWidth="1.5" rx="1"/>
                </g>

                {/* Phase 3: Skeletal Frame (Concrete Pillars and Ceiling/Floor Slabs in front of walls) */}
                <g className="house-pillars">
                  {/* Ground floor columns */}
                  <rect className="house-pillar" x="240" y="320" width="24" height="145" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="440" y="320" width="24" height="145" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="560" y="320" width="24" height="145" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="740" y="320" width="24" height="145" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  {/* First floor columns */}
                  <rect className="house-pillar" x="240" y="180" width="24" height="140" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="440" y="180" width="24" height="140" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="560" y="180" width="24" height="140" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                  <rect className="house-pillar" x="740" y="180" width="24" height="140" fill="url(#concrete-pillar-grad)" stroke="#475569" strokeWidth="1"/>
                </g>

                {/* Floor Ceiling Slab */}
                <g className="house-slabs">
                  <rect className="house-slab" x="210" y="320" width="580" height="15" fill="url(#concrete-slab-grad)" stroke="#334155" strokeWidth="1.5" rx="1"/>
                  {/* Shadow line under mid slab */}
                  <rect className="house-slab" x="210" y="335" width="580" height="10" fill="url(#slab-shadow)"/>
                </g>

                {/* Phase 5: Roof Slab & Parapet */}
                <g className="house-roof">
                  <rect className="house-roof-slab" x="180" y="165" width="640" height="15" fill="url(#concrete-slab-grad)" stroke="#334155" strokeWidth="1.5" rx="1"/>
                  {/* Shadow under roof slab */}
                  <rect className="house-roof-slab" x="200" y="180" width="600" height="12" fill="url(#slab-shadow)"/>
                </g>

                {/* Phase 5+: Windows, Glazing and Main pivot entrance door */}
                <g className="house-joinery">
                  {/* Ground floor Left Window */}
                  <rect className="house-window-frame" x="290" y="365" width="120" height="80" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="3"/>
                  <rect className="house-glass-reflection" x="290" y="365" width="120" height="80" fill="url(#glass-reflection-grad)"/>
                  <line className="house-window-frame" x1="330" y1="365" x2="330" y2="445" stroke="#1e293b" strokeWidth="2" />
                  <line className="house-window-frame" x1="370" y1="365" x2="370" y2="445" stroke="#1e293b" strokeWidth="2" />

                  {/* Ground floor Right Window */}
                  <rect className="house-window-frame" x="610" y="365" width="105" height="80" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="3"/>
                  <rect className="house-glass-reflection" x="610" y="365" width="105" height="80" fill="url(#glass-reflection-grad)"/>
                  <line className="house-window-frame" x1="662.5" y1="365" x2="662.5" y2="445" stroke="#1e293b" strokeWidth="2" />

                  {/* First floor Left Large Panoramic Window */}
                  <rect className="house-window-frame" x="230" y="210" width="250" height="95" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="3"/>
                  <rect className="house-glass-reflection" x="230" y="210" width="250" height="95" fill="url(#glass-reflection-grad)"/>
                  <line className="house-window-frame" x1="292.5" y1="210" x2="292.5" y2="305" stroke="#1e293b" strokeWidth="2" />
                  <line className="house-window-frame" x1="355" y1="210" x2="355" y2="305" stroke="#1e293b" strokeWidth="2" />
                  <line className="house-window-frame" x1="417.5" y1="210" x2="417.5" y2="305" stroke="#1e293b" strokeWidth="2" />
                  <line className="house-window-frame" x1="230" y1="230" x2="480" y2="230" stroke="#1e293b" strokeWidth="1.5" />

                  {/* First floor Right Slot Windows */}
                  <rect className="house-window-frame" x="530" y="230" width="90" height="40" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="3"/>
                  <rect className="house-glass-reflection" x="530" y="230" width="90" height="40" fill="url(#glass-reflection-grad)"/>
                  <rect className="house-window-frame" x="655" y="230" width="90" height="40" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="3"/>
                  <rect className="house-glass-reflection" x="655" y="230" width="90" height="40" fill="url(#glass-reflection-grad)"/>

                  {/* Pivot Entry Door */}
                  <g className="house-door">
                    {/* Sidelight glass */}
                    <rect x="468" y="337" width="12" height="126" fill="url(#glass-tint-grad)" stroke="#1e293b" strokeWidth="1"/>
                    {/* Pivot Teak door */}
                    <rect x="484" y="337" width="60" height="126" fill="#78350f" stroke="#451a03" strokeWidth="2"/>
                    {/* Modern brass handles */}
                    <rect x="534" y="390" width="3" height="30" fill="#fef08a" rx="1"/>
                    {/* Transom window overhead */}
                    <rect x="464" y="323" width="96" height="12" fill="url(#glass-tint-grad)" stroke="#1e293b"/>
                  </g>
                </g>

                {/* Planters and modern grass */}
                <g className="house-planters">
                  {/* Left stone planter */}
                  <rect className="house-planter" x="180" y="455" width="50" height="25" fill="url(#stone-pattern)" stroke="#1e293b" rx="1"/>
                  {/* Right stone planter */}
                  <rect className="house-planter" x="770" y="455" width="50" height="25" fill="url(#stone-pattern)" stroke="#1e293b" rx="1"/>
                </g>

                {/* Phase 6: Landscaping Realistic Cypress Trees */}
                <g className="house-trees">
                  {/* Left Pine Trees with Trunks */}
                  <g className="house-tree">
                    {/* Tall Tree */}
                    <rect x="137" y="440" width="6" height="40" fill="url(#bark-grad)"/>
                    <path d="M105,450 Q140,462 175,450 Q157,380 140,350 Q123,380 105,450 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M112,380 Q140,390 168,380 Q154,320 140,290 Q126,320 112,380 Z" fill="url(#tree-grad-1)" opacity="0.95"/>
                    <path d="M120,310 Q140,318 160,310 Q150,260 140,240 Q130,260 120,310 Z" fill="url(#tree-grad-2)"/>
                  </g>
                  <g className="house-tree">
                    {/* Medium Tree */}
                    <rect x="103" y="450" width="4" height="30" fill="url(#bark-grad)"/>
                    <path d="M80,460 Q105,470 130,460 Q117,400 105,370 Q93,400 80,460 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M88,390 Q105,398 122,390 Q113,330 105,310 Q97,330 88,390 Z" fill="url(#tree-grad-2)"/>
                  </g>
                  <g className="house-tree">
                    {/* Small Tree */}
                    <rect x="173" y="455" width="4" height="25" fill="url(#bark-grad)"/>
                    <path d="M155,465 Q175,472 195,465 Q185,415 175,390 Q165,415 155,465 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M160,405 Q175,411 190,405 Q182,360 175,340 Q168,360 160,405 Z" fill="url(#tree-grad-2)"/>
                  </g>

                  {/* Right Pine Trees with Trunks */}
                  <g className="house-tree">
                    {/* Tall Tree */}
                    <rect x="857" y="440" width="6" height="40" fill="url(#bark-grad)"/>
                    <path d="M825,450 Q860,462 895,450 Q877,380 860,350 Q843,380 825,450 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M832,380 Q860,390 888,380 Q874,320 860,290 Q846,320 832,380 Z" fill="url(#tree-grad-1)" opacity="0.95"/>
                    <path d="M840,310 Q860,318 880,310 Q870,260 860,240 Q850,260 840,310 Z" fill="url(#tree-grad-2)"/>
                  </g>
                  <g className="house-tree">
                    {/* Medium Tree */}
                    <rect x="888" y="450" width="4" height="30" fill="url(#bark-grad)"/>
                    <path d="M865,460 Q890,470 915,460 Q902,400 890,370 Q878,400 865,460 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M873,390 Q890,398 907,390 Q898,330 890,310 Q882,330 873,390 Z" fill="url(#tree-grad-2)"/>
                  </g>
                  <g className="house-tree">
                    {/* Small Tree */}
                    <rect x="818" y="455" width="4" height="25" fill="url(#bark-grad)"/>
                    <path d="M800,465 Q820,472 840,465 Q830,415 820,390 Q810,415 800,465 Z" fill="url(#tree-grad-1)" opacity="0.85"/>
                    <path d="M805,405 Q820,411 835,405 Q827,360 820,340 Q813,360 805,405 Z" fill="url(#tree-grad-2)"/>
                  </g>
                </g>

                {/* Phase 6+: Lighting sconces & warm window glow overlays */}
                <g className="house-lighting">
                  {/* Warm window glow overlays */}
                  <rect className="house-light-glow" x="291" y="366" width="118" height="78" fill="url(#warm-light-glow)" opacity="0" pointerEvents="none"/>
                  <rect className="house-light-glow" x="611" y="366" width="103" height="78" fill="url(#warm-light-glow)" opacity="0" pointerEvents="none"/>
                  <rect className="house-light-glow" x="231" y="211" width="248" height="93" fill="url(#warm-light-glow)" opacity="0" pointerEvents="none"/>
                  <rect className="house-light-glow" x="531" y="231" width="88" height="38" fill="url(#warm-light-glow)" opacity="0" pointerEvents="none"/>
                  <rect className="house-light-glow" x="656" y="231" width="88" height="38" fill="url(#warm-light-glow)" opacity="0" pointerEvents="none"/>

                  {/* Sconce lights */}
                  {/* Sconce 1 (Entrance Left) */}
                  <rect x="454" y="380" width="4" height="10" fill="#475569"/>
                  <polygon className="house-sconce-glow" points="456,380 435,465 477,465" fill="url(#sconce-cone-down)" opacity="0" pointerEvents="none"/>
                  <polygon className="house-sconce-glow" points="456,390 435,325 477,325" fill="url(#sconce-cone-up)" opacity="0" pointerEvents="none"/>

                  {/* Sconce 2 (Entrance Right) */}
                  <rect x="548" y="380" width="4" height="10" fill="#475569"/>
                  <polygon className="house-sconce-glow" points="550,380 529,465 571,465" fill="url(#sconce-cone-down)" opacity="0" pointerEvents="none"/>
                  <polygon className="house-sconce-glow" points="550,390 529,325 571,325" fill="url(#sconce-cone-up)" opacity="0" pointerEvents="none"/>

                  {/* Sconce 3 (Upper floor Accent) */}
                  <rect x="715" y="240" width="4" height="10" fill="#475569"/>
                  <polygon className="house-sconce-glow" points="717,240 690,320 744,320" fill="url(#sconce-cone-down)" opacity="0" pointerEvents="none"/>
                  <polygon className="house-sconce-glow" points="717,250 690,195 744,195" fill="url(#sconce-cone-up)" opacity="0" pointerEvents="none"/>
                </g>

                {/* Blueprint Drawing Overlay (fades out as realistic fills scale in) */}
                <g className="house-blueprint-lines" stroke="#06b6d4" strokeWidth="1.2" fill="none">
                  {/* Main site outline blueprint */}
                  <rect className="elev-blueprint-line" d="M100 480 H900 V510 H100 Z" strokeDasharray="6 4" />

                  {/* Stone foundation outline blueprint */}
                  <rect className="elev-blueprint-line" x="210" y="465" width="580" height="15" rx="1"/>

                  {/* Pillar structural outlines */}
                  <rect className="elev-blueprint-line" x="240" y="320" width="24" height="145"/>
                  <rect className="elev-blueprint-line" x="440" y="320" width="24" height="145"/>
                  <rect className="elev-blueprint-line" x="560" y="320" width="24" height="145"/>
                  <rect className="elev-blueprint-line" x="740" y="320" width="24" height="145"/>

                  {/* Slabs outlines */}
                  <rect className="elev-blueprint-line" x="210" y="320" width="580" height="15"/>
                  <rect className="elev-blueprint-line" x="180" y="165" width="640" height="15"/>

                  {/* Main wall boxes outline */}
                  <rect className="elev-blueprint-line" x="210" y="180" width="290" height="140"/>
                  <rect className="elev-blueprint-line" x="500" y="180" width="290" height="140"/>
                  <rect className="elev-blueprint-line" x="264" y="335" width="176" height="130"/>
                  <rect className="elev-blueprint-line" x="584" y="335" width="156" height="130"/>

                  {/* Window outlines */}
                  <rect className="elev-blueprint-line" x="290" y="365" width="120" height="80"/>
                  <rect className="elev-blueprint-line" x="610" y="365" width="105" height="80"/>
                  <rect className="elev-blueprint-line" x="230" y="210" width="250" height="95"/>

                  {/* Pivot Door outlines */}
                  <rect className="elev-blueprint-line" x="484" y="337" width="60" height="126"/>

                  {/* Axis Gridlines and bubbles */}
                  <g className="elev-axis-label" opacity="0.4">
                    <line x1="252" y1="130" x2="252" y2="520" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="8 8"/>
                    <circle cx="252" cy="115" r="10" stroke="#06b6d4"/>
                    <text x="252" y="119" fill="#06b6d4" fontSize="10" textAnchor="middle">A</text>

                    <line x1="452" y1="130" x2="452" y2="520" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="8 8"/>
                    <circle cx="452" cy="115" r="10" stroke="#06b6d4"/>
                    <text x="452" y="119" fill="#06b6d4" fontSize="10" textAnchor="middle">B</text>

                    <line x1="572" y1="130" x2="572" y2="520" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="8 8"/>
                    <circle cx="572" cy="115" r="10" stroke="#06b6d4"/>
                    <text x="572" y="119" fill="#06b6d4" fontSize="10" textAnchor="middle">C</text>

                    <line x1="752" y1="130" x2="752" y2="520" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="8 8"/>
                    <circle cx="752" cy="115" r="10" stroke="#06b6d4"/>
                    <text x="752" y="119" fill="#06b6d4" fontSize="10" textAnchor="middle">D</text>

                    {/* Width dimension line */}
                    <line x1="180" y1="150" x2="820" y2="150" stroke="#06b6d4" strokeWidth="1"/>
                    <line x1="180" y1="145" x2="180" y2="155" stroke="#06b6d4" strokeWidth="1.5"/>
                    <line x1="820" y1="145" x2="820" y2="155" stroke="#06b6d4" strokeWidth="1.5"/>
                    <text x="500" y="144" fill="#06b6d4" fontSize="9" textAnchor="middle" fontWeight="bold">TOTAL WIDTH: 42'-0\"</text>

                    {/* Height dimension line */}
                    <line x1="155" y1="165" x2="155" y2="480" stroke="#06b6d4" strokeWidth="1"/>
                    <line x1="150" y1="165" x2="160" y2="165" stroke="#06b6d4" strokeWidth="1.5"/>
                    <line x1="150" y1="480" x2="160" y2="480" stroke="#06b6d4" strokeWidth="1.5"/>
                    <text x="145" y="325" fill="#06b6d4" fontSize="9" textAnchor="middle" transform="rotate(-90 145 325)" fontWeight="bold">TOTAL HEIGHT: 28'-0\"</text>
                  </g>
                </g>
              </svg>

              {/* Particle Canvas on top */}
              <canvas className="elev-particle-canvas" ref={canvasRef} />

              {/* Lens flare & bloom overlays */}
              <div className="elev-bloom-layer" />
              <div className="elev-lens-flare" />

              {/* Cinematic birds flying overlay (active when complete) */}
              <div className="elev-bird-flock-wrap" style={{ display: 'none', position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
                <BirdFlock />
              </div>
            </div>

            <div className="elev-viewport-overlay-text">
              PREPARING PLOT
            </div>
          </div>

          {/* METADATA PANEL & DETAILS */}
          <div className="elev-meta-panel">
            {/* Dimensions */}
            <div className="elev-dims-grid">
              {[
                { label: 'Front Width', value: '42 ft', icon: MoveHorizontal },
                { label: 'Height', value: '28 ft', icon: MoveVertical },
                { label: 'Depth', value: '35 ft', icon: CornerUpRight },
                { label: 'BUA', value: '3,200 sq.ft', icon: Ruler },
              ].map((d, i) => (
                <div key={i} className="elev-dim-card">
                  <span className="edc-icon">
                    <d.icon size={16} strokeWidth={2} />
                  </span>
                  <div className="edc-info">
                    <span className="edc-val">{d.value}</span>
                    <span className="edc-label">{d.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Materials & CTAs (Split Row) */}
            <div className="elev-bottom-row">
              <div className="elev-materials-card">
                <h4 className="emc-title">Exterior Finishes</h4>
                <div className="emc-list">
                  {MATERIALS.map((m, i) => (
                    <div key={i} className="emc-item">
                      <div className="emc-swatch" style={{ backgroundColor: m.swatch }} />
                      <div className="emc-info">
                        <span className="emc-name">{m.name}</span>
                        <span className="emc-usage">{m.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="elev-actions-card">
                <button className="btn-gold" id="download-elevation-btn">
                  <Download size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} /> Download DWG
                </button>
                <button className="btn-ghost" id="ar-view-btn">
                  <Smartphone size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} /> AR Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}