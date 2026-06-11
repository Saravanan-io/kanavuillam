import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Layers, Settings, Grid, Package, Hammer, Home, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import './CostEstimation.css';

const MATERIALS = [
  { label: 'Cement',  amount: '226.8k', icon: Database, color: '#4F46E5' },
  { label: 'Sand',    amount: '140.4k', icon: Layers,   color: '#0EA5E9' },
  { label: 'Steel',   amount: '420.6k', icon: Settings, color: '#2563EB' },
  { label: 'Bricks',  amount: '180.7k', icon: Grid,     color: '#0D9488' },
  { label: 'Other',   amount: '95.3k',  icon: Package,  color: '#6366F1' },
];

const COST_ITEMS = [
  { label: 'Foundation & Structure', amount: 617000, pct: 30, icon: Hammer,   color: '#4F46E5' },
  { label: 'Brickwork & Masonry',    amount: 308500, pct: 15, icon: Grid,     color: '#0D9488' },
  { label: 'Roofing & Waterproof',   amount: 205000, pct: 10, icon: Home,     color: '#0EA5E9' },
  { label: 'Electrical & Plumbing',  amount: 246000, pct: 12, icon: Zap,      color: '#8B5CF6' },
  { label: 'Flooring & Finishing',   amount: 205000, pct: 10, icon: Sparkles, color: '#10B981' },
];

const TOTAL = 2005000;

function AnimatedCounter({ target, prefix = '₹', suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          const v = Math.round(obj.val);
          ref.current.textContent = prefix + v.toLocaleString('en-IN') + suffix;
        }
      },
    });
  }, [started, target, prefix, suffix, duration]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export default function CostEstimation() {
  const sectionRef = useRef(null);
  const canvasRef  = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Money particle canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const SYMBOLS = ['₹', '₹', '₹', '✦', '★', '₹'];
    const particles = Array.from({ length: 70 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * -canvas.height,
      vy:    0.6 + Math.random() * 1.8,
      vx:    (Math.random() - 0.5) * 1.2,
      rot:   Math.random() * 360,
      rotV:  (Math.random() - 0.5) * 3,
      sym:   SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      size:  10 + Math.random() * 14,
      alpha: 0.25 + Math.random() * 0.45,
      color: `hsl(${180 + Math.random() * 70}, 85%, ${50 + Math.random() * 15}%)`,
    }));

    let animId, running = false;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.alpha;
        ctx.font = `bold ${p.size}px sans-serif`;
        ctx.fillStyle = p.color;
        ctx.fillText(p.sym, 0, 0);
        ctx.restore();
      });
      animId = requestAnimationFrame(render);
    };

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      onEnter:     () => { if (!running) { running = true; render(); } },
      onLeaveBack: () => { running = false; cancelAnimationFrame(animId); ctx.clearRect(0, 0, canvas.width, canvas.height); },
    });

    // Content anims
    gsap.fromTo('.cost-title-area',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
    );
    gsap.fromTo('.cost-bar-item',
      { x: -70, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.cost-bars', start: 'top 80%' } }
    );
    gsap.fromTo('.cost-mat-item',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.55, stagger: 0.09, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.cost-materials', start: 'top 82%' } }
    );
    gsap.fromTo('.cost-total-card',
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' } }
    );

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="cost-section" ref={sectionRef}>
      <canvas className="cost-canvas" ref={canvasRef} />
      <div className="cost-burst" />

      <div className="cost-inner">
        {/* Title */}
        <div className="cost-title-area">
          <p className="section-label">Transparent Pricing</p>
          <h2 className="section-title">Estimated Grand Total</h2>
          <p className="section-subtitle">Every rupee accounted for — AI analyzes 2,000+ market data points for precise cost breakdown.</p>
        </div>

        <div className="cost-main">
          {/* Left: total + materials */}
          <div className="cost-left">
            {/* Grand total card */}
            <div className="cost-total-card">
              <div className="ctc-label">Estimated Grand Total</div>
              <div className="ctc-amount">
                ₹ <AnimatedCounter target={20.05} prefix="" suffix=" Lakhs" duration={2.5} />
              </div>
              <div className="ctc-sub">Approx ₹1671/sq ft</div>
              <div className="ctc-tags">
                <span className="ctc-tag ctc-tag-green">
                  <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Market Accurate
                </span>
                <span className="ctc-tag ctc-tag-gold">
                  <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> No Hidden Costs
                </span>
                <span className="ctc-tag ctc-tag-blue">
                  <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Updated Weekly
                </span>
              </div>
            </div>

            {/* Material selection */}
            <div className="cost-materials">
              <div className="cost-mat-title">Material Selection</div>
              <div className="cost-mat-grid">
                {MATERIALS.map((m, i) => (
                  <div key={i} className="cost-mat-item" style={{ '--mat-color': m.color }}>
                    <span className="mat-icon" style={{ display: 'flex', alignItems: 'center', color: m.color }}>
                      <m.icon size={16} strokeWidth={2} />
                    </span>
                    <span className="mat-label">{m.label}</span>
                    <span className="mat-amount">₹{m.amount}</span>
                  </div>
                ))}
                <div className="cost-mat-item cost-mat-total">
                  <span className="mat-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)' }}>
                    <Sparkles size={16} strokeWidth={2} />
                  </span>
                  <span className="mat-label">Total</span>
                  <span className="mat-amount mat-amount-gold">₹20.05L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bar chart */}
          <div className="cost-bars">
            {COST_ITEMS.map((item, i) => (
              <div key={i} className="cost-bar-item">
                <div className="cbi-header">
                  <span className="cbi-icon" style={{ display: 'flex', alignItems: 'center', color: item.color }}>
                    <item.icon size={16} strokeWidth={2} />
                  </span>
                  <span className="cbi-label">{item.label}</span>
                  <span className="cbi-amount">
                    <AnimatedCounter target={item.amount} duration={1.8} />
                  </span>
                </div>

                <div className="cbi-track">
                  <div className="cbi-bar" style={{ background: item.color, width: `${item.pct}%` }} />
                  <span className="cbi-pct">{item.pct}%</span>
                </div>
              </div>
            ))}

            {/* Donut chart */}
            <div className="cost-donut-wrap">
              <svg viewBox="0 0 160 160" className="cost-donut">
                {COST_ITEMS.reduce((acc, item) => {
                  const r = 62, cx = 80, cy = 80;
                  const circ = 2 * Math.PI * r;
                  const offset = (acc.offset / 100) * circ;
                  const dash   = (item.pct / 100) * circ;
                  acc.elements.push(
                    <circle key={acc.offset}
                      cx={cx} cy={cy} r={r} fill="none"
                      stroke={item.color} strokeWidth="30"
                      strokeDasharray={`${dash} ${circ - dash}`}
                      strokeDashoffset={circ / 4 - offset}
                    />
                  );
                  acc.offset += item.pct;
                  return acc;
                }, { elements: [], offset: 0 }).elements}
              </svg>
              <div className="cost-donut-center">
                <div className="cdc-label">Total</div>
                <div className="cdc-val">₹20.05L</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
