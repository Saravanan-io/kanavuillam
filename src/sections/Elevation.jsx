import { useEffect, useRef, useState } from 'react';
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
  { label: 'The Spark',      icon: Sparkles, desc: 'Golden energy beam strikes' },
  { label: 'The Blueprint',  icon: PenTool,  desc: 'Glowing wireframes drawn' },
  { label: 'The Foundation', icon: Building, desc: 'Pillars and slabs emerge' },
  { label: 'Skeletal Frame', icon: Grid,     desc: 'Structural beams connect' },
  { label: 'Walls & Rooms',  icon: Layers,   desc: 'Brickwork and windows slide' },
  { label: 'Roof & Textures',icon: Hammer,   desc: 'Roof panels and cladding grow' },
  { label: 'Home Complete',  icon: Home,     desc: 'Illumination and landscape' },
];

const MATERIALS = [
  { name: 'Premium Granite', usage: 'Exterior Cladding', swatch: '#BDBDBD' },
  { name: 'Teak Wood',       usage: 'Windows & Doors',  swatch: '#A0522D' },
  { name: 'White Stucco',    usage: 'Wall Finish',      swatch: '#F5F5F5' },
  { name: 'Terracotta',      usage: 'Roof Tiles',       swatch: '#CF6039' },
];

export default function Elevation() {
  const containerRef = useRef(null);
  const viewportRef  = useRef(null);
  const canvasRef    = useRef(null);
  const progressRef  = useRef(0);
  
  const [progress, setProgress] = useState(0);

  // Keep a ref to the progress for the canvas animation loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Canvas particle loop
  useEffect(() => {
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

    // Particle class
    class Particle {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'spark', 'blueprint', 'dust', 'mote'
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

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const prog = progressRef.current;

      // Stage 1: Spark particle emitter (rising from ground center)
      if (prog > 0 && prog < 0.12) {
        if (Math.random() < 0.5) {
          particles.push(new Particle(canvas.width * 0.5 + (Math.random() - 0.5) * 60, canvas.height * 0.65, 'spark'));
        }
      }
      // Stage 2: Blueprint scanning particles
      else if (prog >= 0.12 && prog < 0.25) {
        if (Math.random() < 0.3) {
          particles.push(new Particle(Math.random() * canvas.width, canvas.height * (0.3 + Math.random() * 0.4), 'blueprint'));
        }
      }
      // Stage 3 & 4: Dust particles from rising pillars/slabs
      else if (prog >= 0.25 && prog < 0.55) {
        if (Math.random() < 0.4) {
          particles.push(new Particle(canvas.width * (0.28 + Math.random() * 0.55), canvas.height * (0.55 + Math.random() * 0.2), 'dust'));
        }
      }
      // Stage 7 & 8: Gentle golden motes floating
      else if (prog >= 0.85) {
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

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // GSAP ScrollTrigger timeline
  useEffect(() => {
    const context = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=350%', // Scroll depth (longer means slower and more cinematic)
          pin: true,
          scrub: 1.2,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        },
      });

      // Camera dolly zoom
      tl.to(viewportRef.current, { scale: 1.12, ease: 'none' }, 0);

      // Stage 1 -> 2: Golden Spark Pulse & Beam
      tl.fromTo('.elev-spark-beam', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.1 }, 0)
        .fromTo('.elev-spark-ripple', { scale: 0.1, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.12, stagger: 0.05 }, 0.02)
        .to('.elev-spark-beam, .elev-spark-ripple', { opacity: 0, duration: 0.08 }, 0.1);

      // Stage 2: Blueprint lines draw
      tl.fromTo('.elev-blueprint-line', 
        { strokeDashoffset: 1000 }, 
        { strokeDashoffset: 0, opacity: 1, duration: 0.18, ease: 'power2.inOut' }, 
        0.08
      );
      
      // Laser scan sweep
      tl.fromTo('.elev-laser-sweep', 
        { top: '25%', opacity: 0 }, 
        { top: '75%', opacity: 1, duration: 0.18, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 
        0.1
      ).to('.elev-laser-sweep, .elev-svg-blueprint', { opacity: 0, duration: 0.08 }, 0.25);

      // Stage 3: Foundations & Columns grow Y
      tl.fromTo('.elev-concrete-pillar, .elev-foundation-slab',
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom center', duration: 0.18, stagger: 0.02, ease: 'power2.out' },
        0.23
      ).fromTo('.elev-rebar-line',
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom center', duration: 0.12, ease: 'power1.out' },
        0.32
      );

      // Stage 4: Structural Beams lock X
      tl.fromTo('.elev-skeletal-beam',
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: 'left center', duration: 0.15, stagger: 0.03, ease: 'power3.out' },
        0.38
      );

      // Stage 5: Brick walls & glass panels
      tl.fromTo('.elev-brick-wall',
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom center', duration: 0.18, stagger: 0.04, ease: 'power2.out' },
        0.52
      ).fromTo('.elev-glass-pane',
        { x: (i) => i % 2 === 0 ? -120 : 120, opacity: 0 },
        { x: 0, opacity: 0.45, duration: 0.15, ease: 'power3.out' },
        0.60
      );

      // Stage 6: Roof structures fly in & textures fade in
      tl.fromTo('.elev-roof-panel',
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.18, stagger: 0.05, ease: 'power3.out' },
        0.68
      );

      // Stage 7: Transition to full texture (realistic villa)
      tl.fromTo('.elev-final-render',
        { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
        { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.22, ease: 'power2.inOut' },
        0.74
      );

      // Stage 7 & 8: Interior lighting overlays, pool water reflections, landscape greening
      tl.fromTo('.elev-light-overlay',
        { opacity: 0 },
        { opacity: 0.7, duration: 0.15, stagger: 0.04, ease: 'power2.out' },
        0.86
      ).fromTo('.elev-bloom-layer, .elev-lens-flare',
        { opacity: 0 },
        { opacity: 0.95, duration: 0.12, ease: 'power2.out' },
        0.90
      ).to('.elev-concrete-pillar, .elev-foundation-slab, .elev-skeletal-beam, .elev-brick-wall, .elev-glass-pane, .elev-rebar-line, .elev-roof-panel', 
        { opacity: 0, duration: 0.05 },
        0.92
      );

    }, containerRef);

    return () => context.revert();
  }, []);

  // Calculate current active step index
  const getActiveStep = () => {
    if (progress < 0.12) return 0;
    if (progress < 0.25) return 1;
    if (progress < 0.40) return 2;
    if (progress < 0.55) return 3;
    if (progress < 0.70) return 4;
    if (progress < 0.85) return 5;
    return 6;
  };

  const activeStep = getActiveStep();

  return (
    <div className="elev-section" ref={containerRef}>
      {/* Background gradients */}
      <div className="elev-bg">
        <div className="elev-sky" />
        <div className="elev-horizon" />
      </div>

      <div className="elev-inner">
        {/* LEFT COLUMN: 7-Step Stepper */}
        <div className="elev-left-col">
          <div className="elev-stepper-title">
            <span className="est-sub">Build Process</span>
            <h3 className="est-main">Scroll to Build</h3>
            <p className="est-desc">Watch the engineering architecture grow step-by-step.</p>
          </div>

          <div className="elev-stepper-list">
            <div className="elev-stepper-line" style={{ '--height': `${(activeStep / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === activeStep;
              const isCompleted = i < activeStep;
              
              return (
                <div key={i} className={`elev-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
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

        {/* RIGHT COLUMN: Cinematic Viewport + Metadata */}
        <div className="elev-right-col">
          <div className="elev-viewport-wrapper">
            <div className="elev-viewport" ref={viewportRef}>
              
              {/* Layer 0: Site Sky & Empty Ground (Initial Stage) */}
              <div className="elev-base-site">
                <div className="ebs-sky" />
                <div className="ebs-ground-grid" />
              </div>

              {/* Stage 1: Golden Spark Pulse & Beam */}
              <div className="elev-spark-beam" />
              <div className="elev-spark-ripple r1" />
              <div className="elev-spark-ripple r2" />
              <div className="elev-spark-ripple r3" />

              {/* Stage 2: Blueprint SVG Outlines */}
              <svg className="elev-svg-blueprint" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main Ground Slab */}
                <path className="elev-blueprint-line" d="M220 500 L780 500" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" />
                {/* Ground floor structure */}
                <path className="elev-blueprint-line" d="M270 500 L270 340 L560 340 L560 500 Z" stroke="#00d2ff" strokeWidth="2" strokeDasharray="6 4" />
                <path className="elev-blueprint-line" d="M560 500 L560 310 L830 310 L830 500 Z" stroke="#00d2ff" strokeWidth="2" strokeDasharray="6 4" />
                {/* First floor structure */}
                <path className="elev-blueprint-line" d="M270 340 L270 190 L560 190 L560 340 Z" stroke="#00d2ff" strokeWidth="2" strokeDasharray="6 4" />
                <path className="elev-blueprint-line" d="M560 310 L560 170 L830 170 L830 310 Z" stroke="#00d2ff" strokeWidth="2" strokeDasharray="6 4" />
                {/* Cantilever roof lines */}
                <path className="elev-blueprint-line" d="M190 190 L580 190" stroke="#00d2ff" strokeWidth="3" />
                <path className="elev-blueprint-line" d="M540 170 L870 170" stroke="#00d2ff" strokeWidth="3" />
                {/* Pool outline */}
                <path className="elev-blueprint-line" d="M240 500 L240 570 L520 570 L520 500 Z" stroke="#00d2ff" strokeWidth="2" />
              </svg>
              <div className="elev-laser-sweep" />

              {/* Stage 3: Foundation concrete elements */}
              <div className="elev-foundation-slab fs-1" style={{ left: '22%', width: '56%', bottom: '20%', height: '3%' }} />
              <div className="elev-foundation-slab fs-2" style={{ left: '56%', width: '27%', bottom: '20%', height: '5%' }} />
              
              {/* Columns & Rebars */}
              <div className="elev-concrete-pillar col-1" style={{ left: '27%', bottom: '23%', height: '17%', width: '2.2%' }}>
                <div className="elev-rebar-line" />
              </div>
              <div className="elev-concrete-pillar col-2" style={{ left: '41%', bottom: '23%', height: '17%', width: '2.2%' }}>
                <div className="elev-rebar-line" />
              </div>
              <div className="elev-concrete-pillar col-3" style={{ left: '56%', bottom: '23%', height: '17%', width: '2.2%' }}>
                <div className="elev-rebar-line" />
              </div>
              <div className="elev-concrete-pillar col-4" style={{ left: '70%', bottom: '25%', height: '17%', width: '2.2%' }}>
                <div className="elev-rebar-line" />
              </div>
              <div className="elev-concrete-pillar col-5" style={{ left: '83%', bottom: '25%', height: '17%', width: '2.2%' }}>
                <div className="elev-rebar-line" />
              </div>

              {/* First Floor columns */}
              <div className="elev-concrete-pillar col-1b" style={{ left: '27%', bottom: '43%', height: '17%', width: '2.2%' }} />
              <div className="elev-concrete-pillar col-2b" style={{ left: '41%', bottom: '43%', height: '17%', width: '2.2%' }} />
              <div className="elev-concrete-pillar col-3b" style={{ left: '56%', bottom: '43%', height: '17%', width: '2.2%' }} />
              <div className="elev-concrete-pillar col-4b" style={{ left: '70%', bottom: '45%', height: '17%', width: '2.2%' }} />
              <div className="elev-concrete-pillar col-5b" style={{ left: '83%', bottom: '45%', height: '17%', width: '2.2%' }} />

              {/* Stage 4: Structural Beams */}
              <div className="elev-skeletal-beam beam-1" style={{ left: '25%', bottom: '40%', width: '33%', height: '3%' }} />
              <div className="elev-skeletal-beam beam-2" style={{ left: '55%', bottom: '42%', width: '30%', height: '3%' }} />
              <div className="elev-skeletal-beam beam-3" style={{ left: '19%', bottom: '60%', width: '39%', height: '3.5%' }} />
              <div className="elev-skeletal-beam beam-4" style={{ left: '54%', bottom: '62%', width: '33%', height: '3.5%' }} />

              {/* Stage 5: Brick Walls & Glass Panes */}
              <div className="elev-brick-wall w-1" style={{ left: '30%', bottom: '23%', width: '10%', height: '17%' }} />
              <div className="elev-brick-wall w-2" style={{ left: '58%', bottom: '23%', width: '11%', height: '17%' }} />
              <div className="elev-brick-wall w-3" style={{ left: '58%', bottom: '45%', width: '12%', height: '17%' }} />
              
              <div className="elev-glass-pane gl-1" style={{ left: '43%', bottom: '23%', width: '11%', height: '17%' }} />
              <div className="elev-glass-pane gl-2" style={{ left: '72%', bottom: '25%', width: '10%', height: '17%' }} />
              <div className="elev-glass-pane gl-3" style={{ left: '29%', bottom: '43%', width: '11%', height: '17%' }} />

              {/* Stage 6: Roof Panels */}
              <div className="elev-roof-panel r-left" style={{ left: '18%', bottom: '63%', width: '41%', height: '4%' }} />
              <div className="elev-roof-panel r-right" style={{ left: '54%', bottom: '65%', width: '34%', height: '4%' }} />

              {/* Particle Canvas */}
              <canvas className="elev-particle-canvas" ref={canvasRef} />

              {/* Stage 7: Completed realistic villa render */}
              <img 
                src="/realistic_luxury_villa.png" 
                alt="Realistic Luxury Villa Elevation" 
                className="elev-final-render" 
              />

              {/* Stage 7+: Warm Interior Window Lights Overlays (glowing) */}
              <div className="elev-light-overlay l-ground-left" style={{ left: '42%', bottom: '23%', width: '12%', height: '18%' }} />
              <div className="elev-light-overlay l-ground-right" style={{ left: '71%', bottom: '25%', width: '11%', height: '18%' }} />
              <div className="elev-light-overlay l-first-left" style={{ left: '29%', bottom: '43%', width: '12%', height: '18%' }} />
              <div className="elev-light-overlay l-first-center" style={{ left: '56%', bottom: '43%', width: '12%', height: '18%' }} />

              {/* Lens flare & bloom overlays */}
              <div className="elev-bloom-layer" />
              <div className="elev-lens-flare" />

              {/* Cinematic birds flying overlay (active when complete) */}
              {progress >= 0.85 && <BirdFlock />}
            </div>
            
            <div className="elev-viewport-overlay-text">
              {progress < 0.12 && 'PREPARING PLOT'}
              {progress >= 0.12 && progress < 0.25 && 'SCANNING BLUEPRINT'}
              {progress >= 0.25 && progress < 0.40 && 'CASTING FOUNDATION'}
              {progress >= 0.40 && progress < 0.55 && 'LOCKING SKELETON'}
              {progress >= 0.55 && progress < 0.70 && 'ASSEMBLING WALLS'}
              {progress >= 0.70 && progress < 0.85 && 'PLACING CLADDING & ROOF'}
              {progress >= 0.85 && 'CINEMATIC HERO SHOT'}
            </div>
          </div>

          {/* METADATA PANEL & DETAILS */}
          <div className="elev-meta-panel">
            {/* Dimensions */}
            <div className="elev-dims-grid">
              {[
                { label: 'Front Width', value: '42 ft', icon: MoveHorizontal },
                { label: 'Height',      value: '28 ft', icon: MoveVertical },
                { label: 'Depth',       value: '35 ft', icon: CornerUpRight },
                { label: 'BUA',         value: '3,200 sq.ft', icon: Ruler },
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
