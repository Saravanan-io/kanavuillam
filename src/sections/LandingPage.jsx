import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BirdFlock from '../components/BirdFlock';
import FallingStones from '../components/FallingStones';
import './LandingPage.css';

export default function LandingPage({ ready }) {
  const heroRef    = useRef(null);
  const titleRef   = useRef(null);
  const withAiRef  = useRef(null);
  const paraRef    = useRef(null);
  const raysRef    = useRef(null);
  const particleRef = useRef(null);
  const imageRef   = useRef(null);

  /* ── Canvas particles (subtle blue sparkles) ── */
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const COLORS = [
      'rgba(99,102,241,', 'rgba(79,70,229,',
      'rgba(147,160,250,', 'rgba(199,210,254,',
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 40,
      r: 1 + Math.random() * 2,
      vy: -(0.25 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.4,
      alpha: 0.08 + Math.random() * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      phaseS: 0.01 + Math.random() * 0.015,
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.phase += p.phaseS;
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.fill();
        p.x += p.vx + 0.2 * Math.sin(p.phase * 0.3);
        p.y += p.vy;
        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  /* ── Image processing to remove white background via flood fill ── */
  const [processedImg, setProcessedImg] = useState(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  );
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    const imgUrl = '/floating_house.png';
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Use top-left corner as the reference background color
      const refR = data[0];
      const refG = data[1];
      const refB = data[2];

      const queue = [];
      const visited = new Uint8Array(width * height);

      const pushPixel = (x, y) => {
        const idx = y * width + x;
        if (visited[idx] === 0) {
          visited[idx] = 1;
          queue.push(idx);
        }
      };

      // Push all four boundaries
      for (let x = 0; x < width; x++) {
        pushPixel(x, 0);
        pushPixel(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        pushPixel(0, y);
        pushPixel(width - 1, y);
      }

      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        const px = idx % width;
        const py = Math.floor(idx / width);

        const dIdx = idx * 4;
        const r = data[dIdx];
        const g = data[dIdx + 1];
        const b = data[dIdx + 2];

        // Euclidean color distance threshold
        const dist = Math.sqrt(
          Math.pow(r - refR, 2) +
          Math.pow(g - refG, 2) +
          Math.pow(b - refB, 2)
        );

        if (dist < 18) {
          data[dIdx + 3] = 0; // Transparent

          if (px > 0) pushPixel(px - 1, py);
          if (px < width - 1) pushPixel(px + 1, py);
          if (py > 0) pushPixel(px, py - 1);
          if (py < height - 1) pushPixel(px, py + 1);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      try {
        setProcessedImg(canvas.toDataURL('image/png'));
        setImgReady(true);
      } catch (e) {
        console.error('Canvas processing data URL export failed:', e);
        setProcessedImg(imgUrl);
        setImgReady(true);
      }
    };
    img.onerror = () => {
      setProcessedImg(imgUrl);
      setImgReady(true);
    };
  }, []);

  // Set initial hidden states on mount so there is no flash when doors open
  useEffect(() => {
    gsap.set([raysRef.current, withAiRef.current, paraRef.current, imageRef.current], { opacity: 0 });
    const words = titleRef.current?.querySelectorAll('.word');
    if (words?.length) {
      gsap.set(words, { opacity: 0 });
    }
  }, []);

  /* ── GSAP entrance timeline ── */
  useEffect(() => {
    if (!ready) return;

    const tl = gsap.timeline({ delay: 0.2 });

    // 1) Rays burst (subtle)
    tl.fromTo(raysRef.current,
      { opacity: 0, scale: 0.6 },
      { opacity: 0.6, scale: 1, duration: 1.8, ease: 'power2.out' },
      0,
    );

    // 2) Title words reveal
    const words = titleRef.current?.querySelectorAll('.word');
    if (words?.length) {
      tl.fromTo(words,
        { y: 60, opacity: 0, skewY: 3 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' },
        0,
      );
    }

    // 3) "With AI-Powered" subtitle
    tl.fromTo(withAiRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      0.5,
    );

    // 4) Paragraph
    tl.fromTo(paraRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      0.7,
    );

    // 5) Image fade & scale in
    tl.fromTo(imageRef.current,
      { opacity: 0, scale: 0.8, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power4.out' },
      0.5
    );

    // Parallax on scroll — sky only
    gsap.to('.landing-sky', {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '#landing', start: 'top top', end: 'bottom top', scrub: true },
    });
  }, [ready]);

  const scrollDown = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="landing" ref={heroRef}>

      {/* Sky / background layers */}
      <div className="landing-sky">
        <div className="sky-gradient" />
        <div className="sky-clouds">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
        </div>
      </div>

      {/* Sunlight rays (subtle, for animation) */}
      <div className="sun-rays" ref={raysRef}>
        <div className="sun-core" />
        {[...Array(9)].map((_, i) => (
          <div key={i} className={`sun-ray ray-${i + 1}`} />
        ))}
      </div>

      {/* Particles */}
      <canvas className="landing-particles" ref={particleRef} />

      {/* Birds effect — untouched */}
      <BirdFlock />

      {/* ── Main Hero Split Content ── */}
      <div className="landing-container">
        <div className="landing-text-content">

          {/* Hero title */}
          <h1 className="landing-title" ref={titleRef}>
            <span className="word">Build</span>{' '}
            <span className="word">Your</span>{' '}
            <span className="word title-blue">Dream</span>{' '}
            <span className="word title-blue">Home</span>
          </h1>

          {/* "With AI-Powered Architecture" subtitle */}
          <p className="landing-with-ai" ref={withAiRef}>
            With AI-Powered Architecture
          </p>

          {/* Description */}
          <p className="landing-paragraph" ref={paraRef}>
            Cinematic 3D visualization, Vastu compliance,
            cost estimation &amp; structural reports —
            powered by AI, delivered instantly.
          </p>


        </div>

        <div className="landing-image-content" ref={imageRef}>
          <div className="image-bg-glow" />
          <FallingStones imgReady={imgReady} />
          <img
            src={processedImg}
            alt="AI Designed Floating House"
            className={`floating-house-img ${imgReady ? 'ready' : 'loading'}`}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator" onClick={scrollDown}>
        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
        <span>Scroll</span>
      </div>

      {/* Bottom fade */}
      <div className="landing-fade-bottom" />
    </div>
  );
}
