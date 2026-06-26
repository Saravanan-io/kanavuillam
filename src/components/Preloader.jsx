import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Preloader.css';

export default function Preloader({ onComplete }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const percentRef = useRef(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let prog = 0;
    const total = 1800; // ms total fake-load time
    const step = 16;   // ~60fps

    // Animate the progress counter
    const interval = setInterval(() => {
      prog = Math.min(prog + (100 / (total / step)) * (0.8 + Math.random() * 0.4), 100);
      const rounded = Math.floor(prog);
      setPct(rounded);
      if (prog >= 100) {
        clearInterval(interval);
        // Small pause then cinematic exit
        setTimeout(() => {
          const tl = gsap.timeline({ onComplete });
          tl.to(logoRef.current, { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' });
          tl.to(overlayRef.current, {
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 0.85,
            ease: 'power4.inOut',
          }, '-=0.1');
        }, 200);
      }
    }, step);

    // Logo entrance
    gsap.fromTo(logoRef.current,
      { autoAlpha: 0, y: 24, scale: 0.88 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)', delay: 0.15 }
    );

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="preloader" ref={overlayRef}>
      {/* Animated background grid */}
      <div className="pre-grid" />
      {/* Glow orbs */}
      <div className="pre-orb pre-orb-1" />
      <div className="pre-orb pre-orb-2" />

      <div className="pre-content" ref={logoRef}>
        {/* Logo mark */}
        <div className="pre-logo">
          <img src="/kanavu_illam_logo.png" alt="Kanavu Illam Logo" className="pre-logo-img" />
        </div>

        {/* Progress bar */}
        <div className="pre-progress-wrap">
          <div className="pre-progress-track">
            <div className="pre-progress-bar" style={{ width: `${pct}%` }}>
              <div className="pre-boy-container">
                <svg viewBox="0 0 24 28" className="pre-boy-svg">
                  <g className="boy-body-group">
                    <circle cx="12" cy="5" r="2.5" className="boy-head" />
                    <line x1="12" y1="7.5" x2="12" y2="14" className="boy-torso" />
                    <g className="boy-limb boy-arm-l">
                      <line x1="12" y1="9" x2="8" y2="13" />
                      <line x1="8" y1="13" x2="5" y2="11" />
                    </g>
                    <g className="boy-limb boy-arm-r">
                      <line x1="12" y1="9" x2="16" y2="13" />
                      <line x1="16" y1="13" x2="19" y2="10" />
                    </g>
                    <g className="boy-limb boy-leg-l">
                      <line x1="12" y1="14" x2="9" y2="19" />
                      <line x1="9" y1="19" x2="6" y2="24" />
                    </g>
                    <g className="boy-limb boy-leg-r">
                      <line x1="12" y1="14" x2="15" y2="19" />
                      <line x1="15" y1="19" x2="18" y2="24" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
            <div className="pre-progress-glow" style={{ width: `${pct}%` }} />
          </div>
          <span className="pre-percent" ref={percentRef}>{pct}%</span>
        </div>

        <p className="pre-status">
          {pct < 30 ? 'Initializing rendering engine…'
            : pct < 60 ? 'Loading 3D assets…'
              : pct < 85 ? 'Preparing your workspace…'
                : 'Almost ready…'}
        </p>
      </div>
    </div>
  );
}
