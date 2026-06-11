import { useEffect, useRef } from 'react';

/**
 * Global ambient gold dust particles — always floating in the background.
 * Very subtle opacity, warm gold tones, upward drift.
 */
export default function AmbientParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;

    // Particles — professional indigo / cyan / blue tones
    const COUNT = 55;
    const COLORS = [
      'rgba(79,70,229,',
      'rgba(6,182,212,',
      'rgba(99,102,241,',
      'rgba(14,165,233,',
    ];

    const particles = Array.from({ length: COUNT }, () => ({
      x:    Math.random() * w,
      y:    Math.random() * h,
      r:    0.8 + Math.random() * 2.2,
      vy:   -(0.15 + Math.random() * 0.35),
      vx:   (Math.random() - 0.5) * 0.18,
      alpha: 0.08 + Math.random() * 0.22,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkleSpeed: 0.004 + Math.random() * 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const render = (time = 0) => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.twinklePhase += p.twinkleSpeed;
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.twinklePhase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      });
      animId = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ambient-canvas"
      aria-hidden="true"
    />
  );
}
