import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DoorOpen, ChefHat, Bed, ChevronsUp, Compass, Sparkles } from 'lucide-react';
import './VastuReport.css';

const VASTU_ZONES = [
  { dir: 'N',  label: 'North',      deity: 'Kubera',   element: 'Water', color: '#0EA5E9', score: 95, angle: 0 },
  { dir: 'NE', label: 'North-East', deity: 'Ishanya',  element: 'Space', color: '#6366F1', score: 98, angle: 45 },
  { dir: 'E',  label: 'East',       deity: 'Indra',    element: 'Air',   color: '#10B981', score: 92, angle: 90 },
  { dir: 'SE', label: 'South-East', deity: 'Agni',     element: 'Fire',  color: '#EF4444', score: 88, angle: 135 },
  { dir: 'S',  label: 'South',      deity: 'Yama',     element: 'Earth', color: '#4F46E5', score: 85, angle: 180 },
  { dir: 'SW', label: 'South-West', deity: 'Niruthi',  element: 'Earth', color: '#8B5CF6', score: 90, angle: 225 },
  { dir: 'W',  label: 'West',       deity: 'Varuna',   element: 'Water', color: '#2563EB', score: 94, angle: 270 },
  { dir: 'NW', label: 'North-West', deity: 'Vayu',     element: 'Air',   color: '#06B6D4', score: 91, angle: 315 },
];

const PLACEMENTS = [
  { room: 'Entrance',       dir: 'South (West)',      icon: DoorOpen },
  { room: 'Kitchen',        dir: 'South-East (Good)', icon: ChefHat },
  { room: 'Master Bedroom', dir: 'South-West (Best)', icon: Bed },
  { room: 'Staircase',      dir: 'South-East (Okay)', icon: ChevronsUp },
];

export default function VastuReport() {
  const sectionRef  = useRef(null);
  const compassRef  = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 62%',
        toggleActions: 'play none none reverse',
      }
    });

    // Jump + float entrance
    tl.fromTo(sectionRef.current,
      { y: 50 },
      { y: 0, duration: 0.3, ease: 'power4.out' }
    )
    .fromTo(sectionRef.current,
      { scale: 0.97 },
      { scale: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.5)' }, '<'
    );

    // Compass spin-in
    tl.fromTo(compassRef.current,
      { rotation: -180, scale: 0, opacity: 0 },
      { rotation: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'back.out(1.6)' }, 0.1
    );

    // Float continuously
    gsap.to(compassRef.current, {
      y: -14, duration: 2.8, ease: 'power1.inOut', yoyo: true, repeat: -1,
    });

    // Energy rings pulse
    gsap.to('.energy-ring', {
      scale: 1.18, opacity: 0,
      duration: 2, ease: 'power2.out',
      stagger: 0.4, repeat: -1,
    });

    // Content stagger
    tl.fromTo('.vastu-title-area', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);
    tl.fromTo('.vastu-item', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.5);
    tl.fromTo('.vastu-place-row', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.6);

    // Score bar reveal
    tl.fromTo('.vastu-zone-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', transformOrigin: 'left' }, 0.6);

    // Sparkle particles
    gsap.to('.lotus-particle', {
      y: '-=50', opacity: 0, duration: 3.5, ease: 'power1.out', stagger: 0.35, repeat: -1,
    });
  }, []);

  return (
    <div className="vastu-section" ref={sectionRef}>
      {/* Mandala BG */}
      <div className="vastu-mandala-bg" aria-hidden="true">
        <div className="mandala-ring ring-1" />
        <div className="mandala-ring ring-2" />
        <div className="mandala-ring ring-3" />
        <div className="mandala-ring ring-4" />
      </div>

      {/* Sparkle particles */}
      <div className="lotus-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="lotus-particle" style={{
            left: `${6 + i * 6.5}%`,
            bottom: `${8 + (i % 4) * 9}%`,
            animationDelay: `${i * 0.5}s`,
            fontSize: `${0.7 + (i % 3) * 0.35}rem`,
            color: 'rgba(99, 102, 241, 0.45)',
          }}>
            {['✦', '✧', '•', '◦'][i % 4]}
          </div>
        ))}
      </div>

      <div className="vastu-inner">
        {/* LEFT */}
        <div className="vastu-left">
          {/* Compass with energy rings */}
          <div className="vastu-compass-wrap" ref={compassRef}>
            {/* Energy rings */}
            <div className="energy-ring energy-ring-1" />
            <div className="energy-ring energy-ring-2" />
            <div className="energy-ring energy-ring-3" />

            <div className="vastu-compass">
              {/* Floor plan inside */}
              <div className="compass-floorplan">
                <FloorPlanSVG />
              </div>

              <div className="compass-center">
                <Compass className="compass-center-icon" size={20} style={{ color: 'var(--gold)', marginBottom: '2px' }} />
                <span className="compass-score">68/100</span>
                <span className="compass-label">Vastu Score</span>
              </div>

              {VASTU_ZONES.map((zone) => (
                <div key={zone.dir} className="compass-zone" style={{ '--angle': `${zone.angle}deg`, '--color': zone.color }}>
                  <div className="zone-label">
                    <span className="zone-dir">{zone.dir}</span>
                    <span className="zone-deity">{zone.deity}</span>
                  </div>
                </div>
              ))}

              <div className="compass-lines">
                <div className="compass-line compass-line-ns" />
                <div className="compass-line compass-line-ew" />
                <div className="compass-line compass-line-diag1" />
                <div className="compass-line compass-line-diag2" />
              </div>
              <div className="compass-needle">
                <div className="needle-north" />
                <div className="needle-south" />
              </div>

              {/* Cardinal labels */}
              <div className="cardinal north-label">NORTH</div>
              <div className="cardinal south-label">SOUTH</div>
              <div className="cardinal east-label">EAST</div>
              <div className="cardinal west-label">WEST</div>
            </div>
          </div>

          {/* Zone bars */}
          <div className="vastu-zones-grid">
            {VASTU_ZONES.slice(0, 4).map(zone => (
              <div key={zone.dir} className="vastu-zone-card">
                <div className="vz-header">
                  <span className="vz-dir" style={{ color: zone.color }}>{zone.dir}</span>
                  <span className="vz-score">{zone.score}%</span>
                </div>
                <div className="vastu-zone-track">
                  <div className="vastu-zone-bar" style={{ background: zone.color, width: `${zone.score}%` }} />
                </div>
                <span className="vz-element">{zone.element} · {zone.deity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="vastu-right">
          <div className="vastu-title-area">
            <p className="section-label">Ancient Wisdom · Modern AI</p>
            <h2 className="section-title">Vastu Analysis<br/>Overview</h2>
            <p className="section-subtitle">
              Every room analyzed against 5,000-year-old Vedic architecture principles with modern AI precision.
            </p>
            <div className="gradient-line" />
          </div>

          {/* Score hero */}
          <div className="vastu-score-hero">
            <div className="vsh-left">
              <div className="vsh-score-num">68</div>
              <div className="vsh-score-sub">/100</div>
              <div className="vsh-grade">Good Compliance</div>
            </div>
            <div className="vsh-bars">
              <div className="vsh-bar-row">
                <span className="vsh-bar-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} style={{ color: '#10B981' }} /> Positive Energy
                </span>
                <div className="vsh-bar-track">
                  <div className="vsh-bar-fill" style={{ width: '75%', background: '#10B981' }} />
                </div>
                <span className="vsh-bar-pct">75%</span>
              </div>
              <div className="vsh-bar-row">
                <span className="vsh-bar-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Compass size={13} style={{ color: 'var(--gold)' }} /> Vastu Balance
                </span>
                <div className="vsh-bar-track">
                  <div className="vsh-bar-fill" style={{ width: '80%', background: 'var(--gold)' }} />
                </div>
                <span className="vsh-bar-pct">80%</span>
              </div>
            </div>
          </div>

          {/* Placement analysis */}
          <div className="vastu-placement">
            <h3 className="vastu-recs-title">Placement Analysis</h3>
            {PLACEMENTS.map((p, i) => (
              <div key={i} className="vastu-place-row">
                <span className="vastu-place-icon" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
                  <p.icon size={16} strokeWidth={2} />
                </span>
                <span className="vastu-place-room">{p.room}</span>
                <span className="vastu-place-dir">{p.dir}</span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="vastu-recs" style={{ marginTop: '1.5rem' }}>
            {[
              { icon: DoorOpen, text: 'Main entrance facing North-East for prosperity', score: 98 },
              { icon: Bed, text: 'Master bedroom in South-West for stability',    score: 95 },
              { icon: ChefHat, text: 'Kitchen in South-East (Agni zone) for health',   score: 92 },
            ].map((rec, i) => (
              <div key={i} className="vastu-item">
                <span className="vastu-item-icon" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
                  <rec.icon size={18} strokeWidth={2} />
                </span>
                <div className="vastu-item-content">
                  <p className="vastu-item-text">{rec.text}</p>
                  <div className="vastu-item-bar-track">
                    <div className="vastu-item-bar" style={{ width: `${rec.score}%` }} />
                  </div>
                </div>
                <span className="vastu-item-score">{rec.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Floor plan SVG inside compass */
function FloorPlanSVG() {
  return (
    <svg viewBox="0 0 100 100" className="floor-plan-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
      {/* Rooms */}
      <rect x="10" y="10" width="40" height="40" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth="1"/>
      <rect x="50" y="10" width="40" height="40" fill="rgba(6,182,212,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth="1"/>
      <rect x="10" y="50" width="40" height="40" fill="rgba(16,185,129,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth="1"/>
      <rect x="50" y="50" width="40" height="40" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth="1"/>
      {/* Labels */}
      <text x="30" y="32" textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="6" fontFamily="var(--font-display)">BED</text>
      <text x="70" y="32" textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="6" fontFamily="var(--font-display)">HALL</text>
      <text x="30" y="72" textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="6" fontFamily="var(--font-display)">KIT</text>
      <text x="70" y="72" textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="6" fontFamily="var(--font-display)">BATH</text>
      {/* Door */}
      <path d="M 50 88 A 8 8 0 0 1 42 80" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1"/>
    </svg>
  );
}
