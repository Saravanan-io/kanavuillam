import React, { useMemo } from 'react';
import './BirdFlock.css';

/**
 * Three-layer cinematic bird flock:
 *  - Layer 0: Background (tiny, slow, high altitude)
 *  - Layer 1: Mid (medium, moderate speed)
 *  - Layer 2: Foreground (larger, faster, slight motion blur)
 */
const LAYERS = [
  {
    count: 10,
    z: 0,
    className: 'bird-bg',
    scale: 0.45,
    speed: [60, 80],
    y:  [5, 14],
    delay: [0, 8],
  },
  {
    count: 7,
    z: 1,
    className: 'bird-mid',
    scale: 0.7,
    speed: [40, 55],
    y: [8, 20],
    delay: [0, 6],
  },
  {
    count: 5,
    z: 2,
    className: 'bird-fg',
    scale: 1.1,
    speed: [22, 36],
    y: [10, 26],
    delay: [0, 4],
  },
];

function BirdSVG({ scale }) {
  return (
    <svg
      viewBox="0 0 60 28"
      className="bird-shape"
      style={{ width: `${scale * 48}px`, height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left wing */}
      <path
        className="wing-l"
        d="M30 16 Q18 6 4 10"
        fill="none"
        stroke="#3A1A0A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Right wing */}
      <path
        className="wing-r"
        d="M30 16 Q42 6 56 10"
        fill="none"
        stroke="#3A1A0A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Body */}
      <ellipse cx="30" cy="17" rx="5" ry="2.5" fill="#3A1A0A" />
    </svg>
  );
}

const BirdFlock = React.memo(function BirdFlock() {
  const birds = useMemo(() => {
    return LAYERS.flatMap((layer) =>
      Array.from({ length: layer.count }, (_, i) => {
        const speed = layer.speed[0] + Math.random() * (layer.speed[1] - layer.speed[0]);
        const yPct  = layer.y[0]    + Math.random() * (layer.y[1] - layer.y[0]);
        const delay = layer.delay[0] + Math.random() * (layer.delay[1] - layer.delay[0]);
        const waver = 2 + Math.random() * 4; // vertical waver amplitude px
        const waverDur = 3 + Math.random() * 4;
        const waverDel = Math.random() * 5;
        const scale = layer.scale + Math.random() * 0.15;

        return {
          key: `${layer.z}-${i}`,
          className: `bird ${layer.className}`,
          style: {
            '--duration':   `${speed}s`,
            '--delay':      `-${delay}s`,
            '--y':          `${yPct}%`,
            zIndex:         layer.z + 2,
          },
          waverStyle: {
            '--waver':      `${waver}px`,
            '--waver-dur':  `${waverDur}s`,
            '--waver-del':  `-${waverDel}s`,
          },
          scale,
        };
      })
    );
  }, []);

  return (
    <div className="bird-flock" aria-hidden="true">
      {birds.map((bird) => (
        <div
          key={bird.key}
          className={bird.className}
          style={bird.style}
        >
          <div className="bird-waver" style={bird.waverStyle}>
            <BirdSVG scale={bird.scale} />
          </div>
        </div>
      ))}
    </div>
  );
});

export default BirdFlock;
