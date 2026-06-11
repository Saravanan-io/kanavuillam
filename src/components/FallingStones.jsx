import { useEffect, useRef } from 'react';
import './FallingStones.css';

export default function FallingStones({ imgReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imgReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let stones = [];
    let dust = [];
    let dustClouds = [];

    // Track spawn timers
    let lastStoneSpawn = 0;
    let lastDustSpawn = 0;
    let lastCloudSpawn = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const getHouseRect = () => {
      const imgEl = document.querySelector('.floating-house-img');
      const canvasEl = canvasRef.current;
      if (!imgEl || !canvasEl) return null;

      const imgRect = imgEl.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();

      return {
        left: imgRect.left - canvasRect.left,
        top: imgRect.top - canvasRect.top,
        width: imgRect.width,
        height: imgRect.height,
      };
    };

    const createStone = (rect) => {
      if (!rect) return null;

      // Spawn along the rocky underside (V-shape outline)
      const t = 0.2 + Math.random() * 0.6; // spawn within the center 60% of the island
      const x = rect.left + rect.width * t;
      
      const distFromCenter = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges
      const y = rect.top + rect.height * (0.66 + 0.18 * (1 - distFromCenter));

      // Depth parameter (z-index buffer)
      const z = 0.2 + Math.random() * 0.8; // Z from 0.2 (far) to 1.0 (close)
      const size = 5 + Math.random() * 11; // base size 5px to 16px

      // Generate stable vertices for a convex polygon representing the stone shape
      const numPoints = 5 + Math.floor(Math.random() * 4); // 5 to 8 points
      const vertices = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const rVar = 0.75 + Math.random() * 0.5; // Radius variability for jagged rock look
        vertices.push({
          x: Math.cos(angle) * size * rVar,
          y: Math.sin(angle) * size * rVar
        });
      }

      // Earthy stone colors matching the rocky under-base of the floating house
      const stoneColors = [
        { r: 90, g: 80, b: 70 },    // Warm dark grey-brown
        { r: 115, g: 102, b: 88 },  // Warm medium grey
        { r: 72, g: 64, b: 56 },    // Deep brown-black
        { r: 135, g: 122, b: 108 }, // Light sandy brown
        { r: 85, g: 85, b: 85 }     // Cold grey
      ];
      const baseColor = stoneColors[Math.floor(Math.random() * stoneColors.length)];

      return {
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,       // slow side drift
        vy: 0.15 + Math.random() * 0.4,        // initial slow drop
        gravity: 0.04 + Math.random() * 0.05,  // acceleration rate
        rotation: Math.random() * Math.PI * 2, // starting rotation
        spin: (Math.random() - 0.5) * 0.015,   // angular speed
        z,
        vertices,
        baseColor
      };
    };

    const createDust = (rect) => {
      if (!rect) return null;
      
      const t = 0.2 + Math.random() * 0.6;
      const x = rect.left + rect.width * t;
      const distFromCenter = Math.abs(t - 0.5) * 2;
      const y = rect.top + rect.height * (0.66 + 0.18 * (1 - distFromCenter));

      return {
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.8 + Math.random() * 1.2,
        r: 0.8 + Math.random() * 1.5,
        alpha: 0.5 + Math.random() * 0.5,
        decay: 0.004 + Math.random() * 0.008
      };
    };

    const createDustCloud = (rect) => {
      if (!rect) return null;

      const t = 0.2 + Math.random() * 0.6;
      const x = rect.left + rect.width * t;
      const distFromCenter = Math.abs(t - 0.5) * 2;
      const y = rect.top + rect.height * (0.66 + 0.18 * (1 - distFromCenter));

      return {
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.1 + Math.random() * 0.2, // falls very slowly
        size: 4 + Math.random() * 4,
        growth: 0.08 + Math.random() * 0.08,
        alpha: 0.08 + Math.random() * 0.06,
        decay: 0.0003 + Math.random() * 0.0005
      };
    };

    const updateAndDraw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const houseRect = getHouseRect();
      if (!houseRect) {
        animationFrameId = requestAnimationFrame(updateAndDraw);
        return;
      }

      const now = Date.now();

      // 1) Spawn Stones (max 18 active stones to keep it clean and cinematic)
      if (stones.length < 18 && now - lastStoneSpawn > 450 + Math.random() * 800) {
        const stone = createStone(houseRect);
        if (stone) {
          stones.push(stone);
          lastStoneSpawn = now;
        }
      }

      // 2) Spawn Dust Particles
      if (dust.length < 35 && now - lastDustSpawn > 120 + Math.random() * 200) {
        const d = createDust(houseRect);
        if (d) {
          dust.push(d);
          lastDustSpawn = now;
        }
      }

      // 3) Spawn Dust Clouds (Smoke/crumbled earth puffs)
      if (dustClouds.length < 12 && now - lastCloudSpawn > 800 + Math.random() * 1200) {
        const cloud = createDustCloud(houseRect);
        if (cloud) {
          dustClouds.push(cloud);
          lastCloudSpawn = now;
        }
      }

      // 4) Update & Draw Dust Clouds
      dustClouds = dustClouds.filter(cloud => {
        cloud.x += cloud.vx;
        cloud.y += cloud.vy;
        cloud.size += cloud.growth;
        cloud.alpha -= cloud.decay;

        if (cloud.alpha <= 0 || cloud.y > height) return false;

        // Draw a soft radial cloud puff
        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.size);
        grad.addColorStop(0, `rgba(135, 122, 108, ${cloud.alpha})`);
        grad.addColorStop(0.3, `rgba(135, 122, 108, ${cloud.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(135, 122, 108, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // 5) Update & Draw Dust Particles
      dust = dust.filter(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.02; // light gravity
        d.alpha -= d.decay;

        if (d.alpha <= 0 || d.y > height) return false;

        ctx.fillStyle = `rgba(110, 98, 86, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // 6) Update & Draw Stones (Sort by Depth Z so background stones render behind foreground)
      stones.sort((a, b) => a.z - b.z);

      stones = stones.filter(stone => {
        // Apply physics
        stone.vy += stone.gravity * stone.z; // foreground stones fall faster
        stone.x += stone.vx;
        stone.y += stone.vy;
        stone.rotation += stone.spin;

        // Boundary check (bottom of canvas)
        if (stone.y > height + 40) return false;

        // Render stone with 3D Facet Shading
        const { x, y, rotation, z, vertices, baseColor } = stone;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Apply scale based on depth
        const scale = 0.25 + 0.75 * z;
        ctx.scale(scale, scale);

        // Cinematic Depth of Field Blur
        let blurVal = 0;
        if (z < 0.4) {
          blurVal = (0.4 - z) * 3.5; // background blur
        } else if (z > 0.85) {
          blurVal = (z - 0.85) * 5.0; // foreground zoom blur
        }

        if (blurVal > 0.5) {
          ctx.filter = `blur(${blurVal.toFixed(1)}px)`;
        } else {
          ctx.filter = 'none';
        }

        // Shadow for foreground stones
        if (z > 0.65) {
          ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
          ctx.shadowBlur = 5 * z;
          ctx.shadowOffsetY = 4 * z;
        }

        // Virtual light angle (top-left, matching sun rays)
        const lightAngle = -Math.PI * 0.4;
        const localLight = lightAngle - rotation;

        const numPoints = vertices.length;
        for (let i = 0; i < numPoints; i++) {
          const p1 = vertices[i];
          const p2 = vertices[(i + 1) % numPoints];

          // Calculate facet normal angle
          const midAngle = Math.atan2((p1.y + p2.y) / 2, (p1.x + p2.x) / 2);
          
          // Shading intensity
          const dot = Math.cos(midAngle - localLight);
          const brightness = 0.45 + 0.75 * ((dot + 1) / 2);

          // Get shaded color
          const r = Math.min(255, Math.floor(baseColor.r * brightness));
          const g = Math.min(255, Math.floor(baseColor.g * brightness));
          const b = Math.min(255, Math.floor(baseColor.b * brightness));
          const opacity = 0.35 + 0.65 * z; // lower opacity for distant stones

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.fill();

          // Render a faint highlight on faces hit directly by light
          if (dot > 0.4) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * dot * z})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        ctx.restore();
        // Reset filter for next rendering steps
        ctx.filter = 'none';
        return true;
      });

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imgReady]);

  return (
    <div className="falling-stones-container">
      <canvas ref={canvasRef} className="falling-stones-canvas" />
    </div>
  );
}
