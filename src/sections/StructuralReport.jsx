import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, Columns, ArrowLeftRight, Scale, ShieldCheck,
  Layers, Wrench, Globe, Wind, CheckCircle2, AlertTriangle,
  Star, FileText
} from 'lucide-react';
import './StructuralReport.css';

const CHECKLIST = [
  { label: 'Foundation Analysis', icon: ArrowDown, status: 'ok' },
  { label: 'Column Design', icon: Columns, status: 'ok' },
  { label: 'Beam Design', icon: ArrowLeftRight, status: 'ok' },
  { label: 'Load Analysis', icon: Scale, status: 'ok' },
  { label: 'Safety Check', icon: ShieldCheck, status: 'ok' },
];

const STRUCTURAL_ITEMS = [
  { label: 'Foundation Type', value: 'RCC Isolated Footing', status: 'verified', icon: ArrowDown },
  { label: 'Column Grade', value: 'M25 Concrete', status: 'verified', icon: Columns },
  { label: 'Beam Size', value: '300×450mm RCC', status: 'verified', icon: ArrowLeftRight },
  { label: 'Slab Thickness', value: '150mm Two-way', status: 'verified', icon: Layers },
  { label: 'Steel Grade', value: 'Fe500 HYSD Bars', status: 'verified', icon: Wrench },
  { label: 'Load Capacity', value: '5 kN/m² Live Load', status: 'verified', icon: Scale },
  { label: 'Seismic Zone', value: 'Zone III – Designed', status: 'caution', icon: Globe },
  { label: 'Wind Load', value: '47 m/s Basic Speed', status: 'verified', icon: Wind },
];

export default function StructuralReport() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Radar scan loop
    const radarSweep = gsap.fromTo('.radar-sweep',
      { yPercent: -100 },
      { yPercent: 200, duration: 4, repeat: -1, ease: 'none' }
    );

    // Detailed scroll-scrubbed blueprint building timeline
    const buildTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: 1.2,
      }
    });

    // 1. Foundation: draw the footings and bottom slab line
    buildTl.fromTo('.bp-footing',
      { strokeDasharray: '100', strokeDashoffset: '100', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 1.5, ease: 'none' }
    );

    // 2. Columns: draw the vertical structural columns from bottom to top
    buildTl.fromTo('.bp-column',
      { strokeDasharray: '150', strokeDashoffset: '150', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 2.0, stagger: 0.1, ease: 'none' },
      '-=0.5'
    );

    // 3. Beams: draw the horizontal concrete/steel deck beams
    buildTl.fromTo('.bp-beam',
      { strokeDasharray: '600', strokeDashoffset: '600', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 1.5, ease: 'none' },
      '-=0.5'
    );

    // 4. Roof Truss: draw the triangular roof rafters and web braces
    buildTl.fromTo('.bp-truss',
      { strokeDasharray: '400', strokeDashoffset: '400', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 2.0, stagger: 0.08, ease: 'none' },
      '-=0.5'
    );

    // 5. Reinforcement Nodes & Moment curves
    buildTl.fromTo('.bp-node',
      { scale: 0, opacity: 0, transformOrigin: 'center' },
      { scale: 1, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'back.out(1.8)' },
      '-=0.5'
    );
    buildTl.fromTo('.bp-moment',
      { strokeDasharray: '50', strokeDashoffset: '50', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 1.2, stagger: 0.05, ease: 'none' },
      '-=0.8'
    );

    // 6. Dimensions and Load Arrows
    buildTl.fromTo('.bp-load line, .bp-load path',
      { strokeDasharray: '30', strokeDashoffset: '30', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 1.0, stagger: 0.05, ease: 'none' },
      '-=0.5'
    );
    buildTl.fromTo('.bp-dim',
      { strokeDasharray: '350', strokeDashoffset: '350', opacity: 0 },
      { strokeDashoffset: '0', opacity: 1, duration: 1.2, ease: 'none' },
      '-=0.8'
    );

    // Fade in spec boxes
    gsap.fromTo('.cad-spec-box',
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' }
      }
    );

    // Right panel content
    gsap.fromTo('.sr-title-area',
      { x: 60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      }
    );
    gsap.fromTo('.sr-item',
      { x: 50, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.sr-items', start: 'top 75%' }
      }
    );
    gsap.fromTo('.sr-check-item',
      { x: 30, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.sr-checklist', start: 'top 78%' }
      }
    );

    // High performance visibility trigger
    const visibilityTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => radarSweep.play(),
      onLeave: () => radarSweep.pause(),
      onEnterBack: () => radarSweep.play(),
      onLeaveBack: () => radarSweep.pause()
    });

    return () => {
      visibilityTrigger.kill();
    };
  }, { scope: sectionRef });

  return (
    <div className="sr-section" ref={sectionRef}>
      <div className="sr-bg">
        <div className="sr-sky" />
        <div className="sr-glow" />
      </div>

      <div className="sr-inner">
        {/* LEFT: Structural CAD Blueprint Interface */}
        <div className="sr-scene blueprint-dashboard">
          {/* Grid Background */}
          <div className="blueprint-grid" />

          {/* Radar Line Sweep */}
          <div className="radar-sweep" />

          {/* Blueprint SVG — professional cyan/slate palette */}
          <svg viewBox="0 0 400 380" className="blueprint-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(6,182,212,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Grid Foundation Line */}
            <line className="bp-footing" x1="40" y1="300" x2="360" y2="300" stroke="#06B6D4" strokeWidth="2" opacity="0.8" />

            {/* 5 Column Footings */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <g key={`footing-${i}`}>
                <rect className="bp-footing" x={x - 15} y="300" width="30" height="15" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />
                <line className="bp-footing" x1={x - 10} y1="307" x2={x + 10} y2="307" stroke="#06B6D4" strokeWidth="1" opacity="0.5" />
              </g>
            ))}

            {/* Vertical Columns (Double lines for realistic column thickness) */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <g key={`column-${i}`}>
                {/* Left column line */}
                <line className="bp-column" x1={x - 3} y1="300" x2={x - 3} y2="160" stroke="#06B6D4" strokeWidth="1.2" opacity="0.8" />
                {/* Right column line */}
                <line className="bp-column" x1={x + 3} y1="300" x2={x + 3} y2="160" stroke="#06B6D4" strokeWidth="1.2" opacity="0.8" />
                {/* Column ties (hashes) */}
                <line className="bp-column" x1={x - 3} y1="260" x2={x + 3} y2="260" stroke="#06B6D4" strokeWidth="0.8" opacity="0.4" />
                <line className="bp-column" x1={x - 3} y1="220" x2={x + 3} y2="220" stroke="#06B6D4" strokeWidth="0.8" opacity="0.4" />
                <line className="bp-column" x1={x - 3} y1="180" x2={x + 3} y2="180" stroke="#06B6D4" strokeWidth="0.8" opacity="0.4" />
              </g>
            ))}

            {/* First Floor Beam (RCC Deck) */}
            <rect className="bp-beam" x="60" y="156" width="280" height="8" rx="1.5" fill="url(#blueGlow)" stroke="#06B6D4" strokeWidth="1.5" opacity="0.9" />

            {/* Second Story Columns (Lighter weight) */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <line key={`upper-col-${i}`} className="bp-column" x1={x} y1="156" x2={x} y2="90" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
            ))}

            {/* Second Story Beam */}
            <line className="bp-beam" x1="60" y1="90" x2="340" y2="90" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />

            {/* Roof Rafter Truss system (Triangle + inner diagonals) */}
            {/* Main outer rafters */}
            <path className="bp-truss" d="M 60 90 L 200 30 L 340 90 Z" fill="none" stroke="#06B6D4" strokeWidth="2" opacity="0.9" />
            {/* Internal web braces */}
            <line className="bp-truss" x1="200" y1="30" x2="200" y2="90" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />
            <line className="bp-truss" x1="130" y1="60" x2="200" y2="90" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />
            <line className="bp-truss" x1="270" y1="60" x2="200" y2="90" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />
            <line className="bp-truss" x1="130" y1="60" x2="80" y2="90" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />
            <line className="bp-truss" x1="270" y1="60" x2="320" y2="90" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />

            {/* Moment / Stress curves (purple arcs showing force bendings) */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <g key={`moment-${i}`}>
                <path className="bp-moment" d={`M ${x - 12} 156 Q ${x} 142 ${x + 12} 156`} fill="none" stroke="#818CF8" strokeWidth="1.5" opacity="0.8" />
                <path className="bp-moment" d={`M ${x - 12} 90 Q ${x} 80 ${x + 12} 90`} fill="none" stroke="#818CF8" strokeWidth="1.2" opacity="0.6" />
              </g>
            ))}

            {/* Connection Joint Nodes */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <g key={`nodes-${i}`}>
                <circle className="bp-node" cx={x} cy="156" r="3.5" fill="#818CF8" />
                <circle className="bp-node" cx={x} cy="90" r="3" fill="#818CF8" />
                <circle className="bp-node" cx={x} cy="300" r="4.5" fill="#06B6D4" />
              </g>
            ))}
            <circle className="bp-node" cx="200" cy="30" r="4.5" fill="#06B6D4" />

            {/* Downward Load Vector Arrows */}
            <g className="bp-load">
              {/* Roof loads */}
              {[100, 150, 200, 250, 300].map((x, i) => {
                // Calculate y coordinate on the roof slope (slope is from (60,90) to (200,30))
                const y = x <= 200 ? 90 - ((x - 60) * 60 / 140) : 30 + ((x - 200) * 60 / 140);
                return (
                  <g key={`load-${i}`}>
                    <line x1={x} y1={y - 15} x2={x} y2={y - 2} stroke="#EF4444" strokeWidth="1.2" opacity="0.85" />
                    <path d={`M ${x - 3} ${y - 6} L ${x} ${y - 2} L ${x + 3} ${y - 6}`} fill="none" stroke="#EF4444" strokeWidth="1.2" opacity="0.85" />
                  </g>
                );
              })}
            </g>

            {/* Dimension markings */}
            <g className="bp-dim">
              <line x1="40" y1="330" x2="360" y2="330" stroke="#64748B" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="325" x2="40" y2="335" stroke="#64748B" strokeWidth="1" />
              <line x1="360" y1="325" x2="360" y2="335" stroke="#64748B" strokeWidth="1" />
              <text x="200" y="345" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace">SPAN: 12.4m</text>

              <line x1="375" y1="30" x2="375" y2="300" stroke="#64748B" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="370" y1="30" x2="380" y2="30" stroke="#64748B" strokeWidth="1" />
              <line x1="370" y1="300" x2="380" y2="300" stroke="#64748B" strokeWidth="1" />
              <text x="388" y="165" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace" transform="rotate(90 388 165)">HEIGHT: 8.5m</text>
            </g>
          </svg>

          {/* Dynamic CAD details overlays */}
          <div className="cad-spec-box spec-top-left">
            <span className="csb-label">LOAD LIMIT</span>
            <span className="csb-val font-mono">5.2 kN/m²</span>
          </div>
          <div className="cad-spec-box spec-top-right">
            <span className="csb-label">DEFLECTION</span>
            <span className="csb-val font-mono">L/350 (PASS)</span>
          </div>
          <div className="cad-spec-box spec-bottom-left">
            <span className="csb-label">M25 CONCRETE</span>
            <span className="csb-val font-mono">f'c = 25 MPa</span>
          </div>
          <div className="cad-spec-box spec-bottom-right">
            <span className="csb-label">STEEL Fe500</span>
            <span className="csb-val font-mono">fy = 500 MPa</span>
          </div>
        </div>

        {/* RIGHT: Content */}
        <div className="sr-right">
          <div className="sr-title-area">
            <p className="section-label">Engineering Excellence</p>
            <h2 className="section-title">Structural<br />Report</h2>
            <p className="section-subtitle">
              Every joint, every beam, every column documented with detailed structural calculations and design data.
            </p>
            <div className="gradient-line" />
          </div>

          {/* Safety card */}
          <div className="sr-safety-card">
            <div className="ssc-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <div className="ssc-content">
              <div className="ssc-title">Structural Safety Grade</div>
              <div className="ssc-grade">A+</div>
              <div className="ssc-sub">Exceeds IS 456:2000 Standards</div>
            </div>
            <div className="ssc-stars" style={{ display: 'flex', gap: '2px', color: '#4F46E5' }}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#4F46E5" strokeWidth={0} />)}
            </div>
          </div>

          {/* Checklist */}
          <div className="sr-checklist">
            <div className="sr-check-title">Structural Checklist</div>
            {CHECKLIST.map((c, i) => (
              <div key={i} className="sr-check-item">
                <span className="sr-check-icon" style={{ display: 'flex', alignItems: 'center', color: '#4F46E5' }}>
                  <c.icon size={14} strokeWidth={2} />
                </span>
                <span className="sr-check-label">{c.label}</span>
                <span className="sr-check-status" style={{ display: 'flex', alignItems: 'center', color: '#10B981' }}>
                  <CheckCircle2 size={14} strokeWidth={2} />
                </span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="sr-items">
            {STRUCTURAL_ITEMS.slice(0, 4).map((item, i) => (
              <div key={i} className={`sr-item sr-item--${item.status}`}>
                <span className="sri-icon" style={{ display: 'flex', alignItems: 'center', color: '#4F46E5' }}>
                  <item.icon size={14} strokeWidth={2} />
                </span>
                <div className="sri-content">
                  <span className="sri-label">{item.label}</span>
                  <span className="sri-value">{item.value}</span>
                </div>
                <span className={`sri-status sri-status--${item.status}`} style={{ display: 'flex', alignItems: 'center' }}>
                  {item.status === 'verified'
                    ? <CheckCircle2 size={14} strokeWidth={2} style={{ color: '#10B981' }} />
                    : <AlertTriangle size={14} strokeWidth={2} style={{ color: '#F59E0B' }} />
                  }
                </span>
              </div>
            ))}
          </div>

          <button className="btn-gold" id="download-structural-btn" style={{ marginTop: '1.5rem' }}>
            <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
