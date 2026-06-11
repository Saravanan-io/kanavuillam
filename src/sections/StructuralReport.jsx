import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, Columns, ArrowLeftRight, Scale, ShieldCheck,
  Layers, Wrench, Globe, Wind, CheckCircle2, AlertTriangle,
  Star, FileText
} from 'lucide-react';
import './StructuralReport.css';

const CHECKLIST = [
  { label: 'Foundation Analysis', icon: ArrowDown,       status: 'ok' },
  { label: 'Column Design',       icon: Columns,         status: 'ok' },
  { label: 'Beam Design',         icon: ArrowLeftRight,  status: 'ok' },
  { label: 'Load Analysis',       icon: Scale,           status: 'ok' },
  { label: 'Safety Check',        icon: ShieldCheck,     status: 'ok' },
];

const STRUCTURAL_ITEMS = [
  { label: 'Foundation Type', value: 'RCC Isolated Footing', status: 'verified', icon: ArrowDown      },
  { label: 'Column Grade',    value: 'M25 Concrete',         status: 'verified', icon: Columns        },
  { label: 'Beam Size',       value: '300×450mm RCC',        status: 'verified', icon: ArrowLeftRight },
  { label: 'Slab Thickness',  value: '150mm Two-way',        status: 'verified', icon: Layers         },
  { label: 'Steel Grade',     value: 'Fe500 HYSD Bars',      status: 'verified', icon: Wrench         },
  { label: 'Load Capacity',   value: '5 kN/m² Live Load',    status: 'verified', icon: Scale          },
  { label: 'Seismic Zone',    value: 'Zone III – Designed',  status: 'caution',  icon: Globe          },
  { label: 'Wind Load',       value: '47 m/s Basic Speed',   status: 'verified', icon: Wind           },
];

export default function StructuralReport() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Radar scan loop
    gsap.fromTo('.radar-sweep',
      { yPercent: -100 },
      { yPercent: 200, duration: 4, repeat: -1, ease: 'none' }
    );

    // Blueprint line draw-in on scroll
    gsap.fromTo('.blueprint-svg path, .blueprint-svg line, .blueprint-svg rect',
      { strokeDasharray: '400', strokeDashoffset: '400', opacity: 0 },
      {
        strokeDashoffset: '0', opacity: 1, duration: 2, ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        }
      }
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
      { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
    );
    gsap.fromTo('.sr-item',
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.sr-items', start: 'top 75%' } }
    );
    gsap.fromTo('.sr-check-item',
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.sr-checklist', start: 'top 78%' } }
    );
  }, []);

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
                <stop offset="0%" stopColor="rgba(6,182,212,0.18)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* House Outline (Blueprint style) */}
            <path d="M 60 300 L 60 160 L 200 60 L 340 160 L 340 300 Z" fill="url(#blueGlow)" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="5,2" opacity="0.6" />
            <path d="M 60 160 L 340 160" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />

            {/* Columns & Foundation lines */}
            {[80, 140, 200, 260, 320].map((x, i) => (
              <g key={i}>
                <line x1={x} y1="300" x2={x} y2="100" stroke="#06B6D4" strokeWidth="1" opacity="0.4" />
                {/* Moment forces / vectors */}
                <path d={`M ${x-10} 160 Q ${x} 140 ${x+10} 160`} fill="none" stroke="#818CF8" strokeWidth="1.5" opacity="0.7" />
                <circle cx={x} cy="160" r="3.5" fill="#818CF8" />
                <circle cx={x} cy="300" r="4" fill="#06B6D4" />
                {/* Footing detail */}
                <rect x={x-15} y="300" width="30" height="15" fill="none" stroke="#06B6D4" strokeWidth="1.2" opacity="0.7" />
              </g>
            ))}

            {/* Dimension Lines */}
            <line x1="40" y1="325" x2="360" y2="325" stroke="#64748B" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="40" y1="320" x2="40" y2="330" stroke="#64748B" strokeWidth="1" />
            <line x1="360" y1="320" x2="360" y2="330" stroke="#64748B" strokeWidth="1" />
            <text x="200" y="340" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">SPAN: 12.4m</text>

            <line x1="375" y1="60" x2="375" y2="300" stroke="#64748B" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="370" y1="60" x2="380" y2="60" stroke="#64748B" strokeWidth="1" />
            <line x1="370" y1="300" x2="380" y2="300" stroke="#64748B" strokeWidth="1" />
            <text x="390" y="185" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace" transform="rotate(90 390 185)">HEIGHT: 8.5m</text>
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
            <h2 className="section-title">Structural<br/>Report</h2>
            <p className="section-subtitle">
              Every joint, every beam, every column calculated by certified structural engineers and verified by AI simulation.
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
