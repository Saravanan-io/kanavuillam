import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './ThreeDView.css';

const CAMERA_CHECKPOINTS = [
  { p: 0.0,  pos: [11, 4.5, 11],    tar: [0, -1.8, 0] },  // Blueprint: overhead looking down at grid
  { p: 0.22, pos: [12, 1.8, 12],    tar: [0, -1.2, 0] },  // Foundation: low angle, corner view as deck rises
  { p: 0.55, pos: [13, 2.2, -7],    tar: [0, -0.2, 0] },  // Walls: reverse angle, seeing ground floor walls and pool
  { p: 0.78, pos: [-10, 3.2, -9],   tar: [-1, 0.6, 0] },  // Cantilever: back angle showing overhang sliding in
  { p: 1.0,  pos: [12, 3.0, 11],    tar: [0, 0.2, 0] }    // Hero Sunset Reveal: wide diagonal front view
];

/* ─── Dust Particles Component ─── */
function DustParticles({ buildRef }) {
  const ref = useRef();
  const positions = useRef(
    new Float32Array(Array.from({ length: 300 }, () => [
      (Math.random() - 0.5) * 18,
      (Math.random()) * 6 - 2.5,
      (Math.random() - 0.5) * 15,
    ]).flat())
  );

  useFrame(() => {
    if (!ref.current) return;
    const progress = buildRef.current.val;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < 300; i++) {
      pos.array[i * 3 + 1] += 0.012 + Math.random() * 0.008;
      if (pos.array[i * 3 + 1] > 4.5) pos.array[i * 3 + 1] = -2.5;
    }
    pos.needsUpdate = true;
    ref.current.material.opacity = progress * 0.55;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={300}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#BAE6FD"
        size={0.07}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Unified House Scene Component (Ref-based animation) ─── */
function HouseScene({ buildRef, controlsRef }) {
  const groupRef = useRef();
  
  // Node Refs
  const blueprintRef = useRef();
  const foundationRef = useRef();
  const groundFloorRef = useRef();
  const cantileverRef = useRef();
  const roofRef = useRef();
  const landscapeRef = useRef();
  
  // Lighting Refs
  const light1Ref = useRef();
  const light2Ref = useRef();
  const light3Ref = useRef();
  const poolLightRef = useRef();

  // Temporary vectors for camera interpolation (prevents GC thrashing)
  const tempPos = useRef(new THREE.Vector3());
  const tempTar = useRef(new THREE.Vector3());

  // ─── PROCEDURAL CANVAS TEXTURES FOR PBR REALISM ───
  const woodTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C28445'; // Rich warm honey-teak wood
    ctx.fillRect(0, 0, 512, 512);
    
    // Horizontal Planks seams only (no vertical seams)
    ctx.strokeStyle = '#5E3E1A';
    ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    // Grain noise
    ctx.fillStyle = 'rgba(94,62,26,0.1)';
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 512;
      ctx.fillRect(0, y, 512, 1 + Math.random() * 1.5);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  const woodBump = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    for (let y = 0; y < 512; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  const concreteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FCFCFC'; // Bright modern plaster white
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.015)';
    for (let i = 0; i < 1500; i++) ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const stoneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#1E293B', '#334155', '#475569', '#64748B'];
    for (let y = 0; y < 512; y += 32) {
      let x = 0;
      while (x < 512) {
        const w = 60 + Math.random() * 120;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + 1, y + 1, w - 2, 30);
        x += w;
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 3);
    return tex;
  }, []);

  const stoneBump = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
      let x = 0;
      while (x < 512) {
        const w = 60 + Math.random() * 120;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 32); ctx.stroke();
        x += w;
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 3);
    return tex;
  }, []);


  const barkTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#5A3825';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#2C1B10';
    ctx.lineWidth = 4;
    for (let y = 0; y < 128; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  useFrame((state) => {
    const progress = buildRef.current.val;
    const camera = state.camera;
    const controls = controlsRef.current;

    // Gentle orbit rotation for the cinematic feel when complete
    if (groupRef.current && progress >= 0.98) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.06;
    } else if (groupRef.current) {
      groupRef.current.rotation.y = 0;
    }

    // Camera Flight Path Interpolation (Orbit Rotate Only, No Zoom)
    const isCinematic = progress < 0.98;
    if (controls) {
      controls.enabled = !isCinematic;
    }

    if (isCinematic) {
      const radius = 16.5;
      const height = 3.2;
      const startTheta = Math.PI * 0.95; // Side view (left-ish)
      const endTheta = Math.PI * 0.23;   // Front-right diagonal hero view
      const theta = startTheta + (endTheta - startTheta) * progress;

      const targetX = radius * Math.cos(theta);
      const targetY = height;
      const targetZ = radius * Math.sin(theta);

      const tarX = 0;
      const tarY = 0.2;
      const tarZ = 0;

      tempPos.current.set(targetX, targetY, targetZ);
      tempTar.current.set(tarX, tarY, tarZ);

      camera.position.lerp(tempPos.current, 0.08);
      if (controls) {
        controls.target.lerp(tempTar.current, 0.08);
        controls.update();
      }
    }

    // 1. Blueprint Outline (Fades out from 0 to 0.35)
    if (blueprintRef.current) {
      const bOpacity = Math.max(0, 1 - progress * 2.85);
      blueprintRef.current.visible = bOpacity > 0.01;
      blueprintRef.current.children.forEach(child => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = bOpacity * (child.userData.baseOpacity || 0.6);
        }
      });
    }

    // 2. Foundation (Grows from 0 to 0.22)
    if (foundationRef.current) {
      const fProg = Math.max(0, Math.min(progress / 0.22, 1));
      foundationRef.current.scale.set(1, fProg, 1);
      foundationRef.current.position.y = -1.8 + (fProg * 0.15);
    }

    // 3. Ground Floor (Builds from 0.18 to 0.55)
    if (groundFloorRef.current) {
      const wProg = Math.max(0, Math.min((progress - 0.18) / 0.37, 1));
      groundFloorRef.current.scale.set(1, wProg, 1);
      groundFloorRef.current.position.y = -1.65 + (wProg * 0.85);
    }

    // 4. Cantilever Upper Floor (Grows and slides in from 0.5 to 0.8)
    if (cantileverRef.current) {
      const uProg = Math.max(0, Math.min((progress - 0.5) / 0.3, 1));
      cantileverRef.current.scale.set(uProg, uProg, uProg);
      const posX = -1.2 + (1 - uProg) * 3.5;
      const posY = 0.9 + (uProg * 0.4);
      cantileverRef.current.position.set(posX, posY - 0.5, 0);
    }

    // 5. Roof Slabs (Falls from above from 0.75 to 0.95)
    if (roofRef.current) {
      const rProg = Math.max(0, Math.min((progress - 0.75) / 0.2, 1));
      roofRef.current.scale.set(1, rProg, 1);
      roofRef.current.position.y = 3.2 - (1 - rProg) * 2;
    }

    // 6. Landscape (Grows from 0.45 to 0.85)
    if (landscapeRef.current) {
      const lProg = Math.max(0, Math.min((progress - 0.45) / 0.4, 1));
      landscapeRef.current.scale.set(lProg, lProg, lProg);
    }

    // 7. Spotlights & Interior Lights (Fade up from 0.65 to 1.0)
    if (light1Ref.current) {
      light1Ref.current.intensity = Math.max(0, (progress - 0.65) * 2.85) * 4.5;
    }
    if (light2Ref.current) {
      light2Ref.current.intensity = Math.max(0, (progress - 0.65) * 2.85) * 3.5;
    }
    if (light3Ref.current) {
      light3Ref.current.intensity = Math.max(0, (progress - 0.7) * 3.3) * 3.0;
    }
    if (poolLightRef.current) {
      poolLightRef.current.intensity = Math.max(0, (progress - 0.65) * 2.85) * 3.0;
    }
  });

  const progress = buildRef.current.val;

  return (
    <group ref={groupRef}>
      {/* 1. 2D Blueprint Outline Group */}
      <group ref={blueprintRef}>
        <gridHelper 
          args={[20, 20, '#6366F1', '#94A3B8']} 
          userData={{ baseOpacity: 0.55 }} 
        />
        <mesh position={[0, -1.79, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ baseOpacity: 0.75 }}>
          <ringGeometry args={[4.8, 5.0, 4]} />
          <meshBasicMaterial color="#6366F1" />
        </mesh>
      </group>

      {/* Clean White Studio Ground */}
      <mesh position={[0, -1.82, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#F8FAFC" roughness={1.0} metalness={0.0} />
      </mesh>

      {/* 2. Foundation, Deck, Planter Boxes and Stairs */}
      <group ref={foundationRef}>
        {/* Concrete Base Platform */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[12.5, 0.3, 9.5]} />
          <meshStandardMaterial map={concreteTexture} roughness={0.8} />
        </mesh>
        {/* Wood Deck */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[12.6, 0.03, 9.6]} />
          <meshStandardMaterial map={woodTexture} bumpMap={woodBump} bumpScale={0.04} roughness={0.5} />
        </mesh>

        {/* Front-Left Planter Box */}
        <group position={[-4.4, 0.25, 3.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.5, 1.6]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[3.0, 0.1, 1.4]} />
            <meshStandardMaterial color="#2c1e15" roughness={0.9} />
          </mesh>
        </group>

        {/* Front-Right Planter Box */}
        <group position={[3.2, 0.25, 3.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.8, 0.5, 1.6]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[5.6, 0.1, 1.4]} />
            <meshStandardMaterial color="#2c1e15" roughness={0.9} />
          </mesh>
        </group>

        {/* Right-Side Planter Box */}
        <group position={[5.8, 0.25, -0.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.0, 0.5, 7.6]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[0.8, 0.1, 7.4]} />
            <meshStandardMaterial color="#2c1e15" roughness={0.9} />
          </mesh>
        </group>

        {/* Wide Wood Deck Steps (Front Left) */}
        <group position={[-1.8, 0.05, 3.8]}>
          {/* Step 1 */}
          <mesh position={[0, -0.05, 0.3]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.1, 0.4]} />
            <meshStandardMaterial map={woodTexture} roughness={0.6} />
          </mesh>
          {/* Step 2 */}
          <mesh position={[0, -0.15, 0.7]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.1, 0.4]} />
            <meshStandardMaterial map={woodTexture} roughness={0.6} />
          </mesh>
        </group>

        {/* Wooden privacy screen/fence */}
        <group position={[2.2, 0.6, 2.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.2, 0.1]} />
            <meshStandardMaterial map={woodTexture} bumpMap={woodBump} bumpScale={0.02} roughness={0.6} />
          </mesh>
          {/* Slat details on front */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <mesh key={idx} position={[0, -0.5 + idx * 0.2, 0.06]} castShadow>
              <boxGeometry args={[3.15, 0.04, 0.03]} />
              <meshStandardMaterial color="#5E3E1A" roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Modern Daybed/Chaise Lounge */}
        <group position={[2.2, 0.08, 3.2]}>
          {/* Wood Base Frame */}
          <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[2.2, 0.06, 1.1]} />
            <meshStandardMaterial map={woodTexture} roughness={0.6} />
          </mesh>
          {/* White Cushion */}
          <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
            <boxGeometry args={[2.1, 0.08, 1.05]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {/* Backrest/Pillows (on the right end, x = 0.8) */}
          <mesh castShadow position={[0.8, 0.18, 0]} rotation={[0, 0, -Math.PI / 12]}>
            <boxGeometry args={[0.3, 0.14, 0.9]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {/* Small accent pillow */}
          <mesh castShadow position={[0.6, 0.17, 0.2]} rotation={[0, -Math.PI / 8, -Math.PI / 6]}>
            <boxGeometry args={[0.22, 0.1, 0.35]} />
            <meshStandardMaterial color="#C28445" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 3. Ground Floor Structure */}
      <group ref={groundFloorRef}>
        {/* White Concrete Left Wall / Frame */}
        <mesh position={[-5.4, 0.85, 0.0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 1.7, 7.8]} />
          <meshStandardMaterial map={concreteTexture} roughness={0.7} />
        </mesh>

        {/* White Concrete Back Wall */}
        <mesh position={[0.0, 0.85, -3.8]} castShadow receiveShadow>
          <boxGeometry args={[11.1, 1.7, 0.2]} />
          <meshStandardMaterial map={concreteTexture} roughness={0.7} />
        </mesh>

        {/* Center-Left sliding glass facade */}
        <mesh position={[-1.2, 0.85, 2.9]}>
          <boxGeometry args={[7.2, 1.6, 0.02]} />
          <meshPhysicalMaterial 
            color="#FFFFFF" 
            transmission={0.9} 
            roughness={0.05} 
            thickness={0.2} 
            clearcoat={1.0} 
            transparent
          />
        </mesh>
        {/* Glass Frames */}
        <mesh position={[-1.2, 1.66, 2.9]} castShadow>
          <boxGeometry args={[7.25, 0.04, 0.06]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-1.2, 0.04, 2.9]} castShadow>
          <boxGeometry args={[7.25, 0.04, 0.06]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glass Mullions */}
        {[-4.8, -2.4, 0, 2.4].map((x, idx) => (
          <mesh key={idx} position={[x, 0.85, 2.9]} castShadow>
            <boxGeometry args={[0.04, 1.6, 0.05]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Right closed room structure with wood accent */}
        <group position={[3.8, 0.85, -0.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.7, 7.0]} />
            <meshStandardMaterial map={woodTexture} bumpMap={woodBump} bumpScale={0.03} roughness={0.6} />
          </mesh>
          {/* Front dark wood panel/door */}
          <mesh position={[0, 0, 3.51]} castShadow>
            <boxGeometry args={[2.8, 1.5, 0.05]} />
            <meshStandardMaterial color="#3E2723" roughness={0.7} />
          </mesh>
        </group>

        {/* Square White Support Column */}
        <mesh position={[2.1, 0.85, 2.9]} castShadow>
          <boxGeometry args={[0.35, 1.7, 0.35]} />
          <meshStandardMaterial map={concreteTexture} roughness={0.7} />
        </mesh>

        {/* Cozy Interior Sofa */}
        <group position={[-1.8, 0.3, 0.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.3, 1.1]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
          </mesh>
          <mesh position={[-1.0, 0, 0.75]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.3, 1.1]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.32, -0.45]} castShadow>
            <boxGeometry args={[3.2, 0.45, 0.2]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
          </mesh>
          <mesh position={[-1.5, 0.32, 0.75]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[2.0, 0.45, 0.2]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
          </mesh>
        </group>

        {/* Coffee Table */}
        <group position={[-1.6, 0.1, 2.0]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.03, 24]} />
            <meshStandardMaterial color="#1E293B" roughness={0.15} metalness={0.2} />
          </mesh>
        </group>

        {/* Floating Interior Stairs */}
        <group position={[-4.7, 0.25, -2.0]} rotation={[0, Math.PI / 2, 0]}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <group key={idx} position={[idx * 0.35, idx * 0.22, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.9, 0.04, 0.28]} />
                <meshStandardMaterial map={woodTexture} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 4. Cantilever Upper Floor Box */}
      <group ref={cantileverRef}>
        {/* --- LEFT SIDE: White Concrete Cantilever Cabin --- */}
        <group position={[-2.4, 0, 0.2]}>
          {/* Cabin Floor */}
          <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.1, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Cabin Ceiling */}
          <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.1, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Cabin Left Wall */}
          <mesh position={[-2.55, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1.6, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Cabin Right Wall */}
          <mesh position={[2.55, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1.6, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Cabin Back Wall */}
          <mesh position={[0, 0, -3.85]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 1.6, 0.1]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Cabin Front Panoramic Glass Window */}
          <mesh position={[0, 0, 3.85]} castShadow>
            <boxGeometry args={[5.0, 1.6, 0.02]} />
            <meshPhysicalMaterial 
              color="#FFFFFF" 
              transmission={0.95} 
              roughness={0.05} 
              thickness={0.2} 
              clearcoat={1.0} 
              transparent
            />
          </mesh>
          {/* Framing */}
          <mesh position={[0, 0.76, 3.85]} castShadow>
            <boxGeometry args={[5.05, 0.04, 0.05]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.76, 3.85]} castShadow>
            <boxGeometry args={[5.05, 0.04, 0.05]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Balcony with Glass Railing */}
          <group position={[0, -0.85, 4.5]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[5.0, 0.1, 1.4]} />
              <meshStandardMaterial map={concreteTexture} roughness={0.7} />
            </mesh>
            {/* Glass panels */}
            <mesh position={[0, 0.45, 0.65]}>
              <boxGeometry args={[4.8, 0.8, 0.015]} />
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.9} transparent roughness={0.05} />
            </mesh>
            <mesh position={[-2.4, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[1.3, 0.8, 0.015]} />
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.9} transparent roughness={0.05} />
            </mesh>
            <mesh position={[2.4, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[1.3, 0.8, 0.015]} />
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.9} transparent roughness={0.05} />
            </mesh>
            {/* Top handrail */}
            <mesh position={[0, 0.85, 0.65]} castShadow>
              <boxGeometry args={[4.82, 0.04, 0.05]} />
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.15} />
            </mesh>
          </group>
        </group>

        {/* --- RIGHT SIDE: Covered Terrace with wood ceiling --- */}
        <group position={[2.8, 0, 0.2]}>
          {/* Terrace Floor Slab */}
          <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.1, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>
          {/* Terrace Wood Paneled Ceiling */}
          <mesh position={[0, 0.80, 0]} castShadow>
            <boxGeometry args={[5.2, 0.05, 7.8]} />
            <meshStandardMaterial map={woodTexture} bumpMap={woodBump} bumpScale={0.02} roughness={0.5} />
          </mesh>
          {/* Terrace Wood Back Wall */}
          <mesh position={[0, -0.025, -3.8]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 1.55, 0.1]} />
            <meshStandardMaterial map={woodTexture} bumpMap={woodBump} bumpScale={0.02} roughness={0.5} />
          </mesh>
          {/* Terrace Right Wall */}
          <mesh position={[2.55, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1.6, 7.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.7} />
          </mesh>

          {/* Dining Table on Terrace */}
          <group position={[0, -0.4, 0.5]}>
            {/* Table Top */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[2.0, 0.06, 1.0]} />
              <meshStandardMaterial map={woodTexture} roughness={0.5} />
            </mesh>
            {/* Table Legs */}
            {[-0.9, 0.9].map((x, idx1) =>
              [-0.4, 0.4].map((z, idx2) => (
                <mesh key={`${idx1}-${idx2}`} position={[x, 0.16, z]} castShadow>
                  <cylinderGeometry args={[0.04, 0.04, 0.38, 8]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
                </mesh>
              ))
            )}
            {/* Chairs with detailed backing and legs */}
            {[-0.7, 0, 0.7].map((x, idx) => (
              <group key={idx}>
                {/* Chair Front Side */}
                <group position={[x, 0.05, -0.65]}>
                  {/* Seat */}
                  <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.36, 0.04, 0.36]} />
                    <meshStandardMaterial color="#FCFCFC" roughness={0.9} />
                  </mesh>
                  {/* Backrest */}
                  <mesh position={[0, 0.26, -0.16]} castShadow>
                    <boxGeometry args={[0.36, 0.28, 0.04]} />
                    <meshStandardMaterial color="#FCFCFC" roughness={0.9} />
                  </mesh>
                  {/* Legs */}
                  {[-0.15, 0.15].map((cx, i1) =>
                    [-0.15, 0.15].map((cz, i2) => (
                      <mesh key={`${i1}-${i2}`} position={[cx, 0.04, cz]} castShadow>
                        <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
                        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
                      </mesh>
                    ))
                  )}
                </group>
                {/* Chair Back Side */}
                <group position={[x, 0.05, 0.65]} rotation={[0, Math.PI, 0]}>
                  {/* Seat */}
                  <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.36, 0.04, 0.36]} />
                    <meshStandardMaterial color="#FCFCFC" roughness={0.9} />
                  </mesh>
                  {/* Backrest */}
                  <mesh position={[0, 0.26, -0.16]} castShadow>
                    <boxGeometry args={[0.36, 0.28, 0.04]} />
                    <meshStandardMaterial color="#FCFCFC" roughness={0.9} />
                  </mesh>
                  {/* Legs */}
                  {[-0.15, 0.15].map((cx, i1) =>
                    [-0.15, 0.15].map((cz, i2) => (
                      <mesh key={`${i1}-${i2}`} position={[cx, 0.04, cz]} castShadow>
                        <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
                        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
                      </mesh>
                    ))
                  )}
                </group>
              </group>
            ))}
          </group>

          {/* Outdoor Umbrella / Parasol */}
          <group position={[1.4, -0.8, 1.8]}>
            {/* Base */}
            <mesh castShadow position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.1, 12]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
            </mesh>
            {/* Pole */}
            <mesh castShadow position={[0, 1.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Canopy (Cone shape pointing up) */}
            <mesh castShadow position={[0, 2.15, 0]}>
              <coneGeometry args={[1.3, 0.5, 16, 1, true]} />
              <meshStandardMaterial color="#FCFCFC" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Canopy Inner Ribs */}
            <mesh position={[0, 2.13, 0]}>
              <coneGeometry args={[1.28, 0.48, 8, 1, true]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Balcony Railing along front of terrace */}
          <group position={[0, -0.85, 3.8]}>
            {/* Glass panel */}
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[5.0, 0.8, 0.015]} />
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.9} transparent roughness={0.05} />
            </mesh>
            {/* Top handrail */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[5.02, 0.04, 0.05]} />
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.15} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 5. Roof Slabs */}
      <group ref={roofRef}>
        {/* Left Roof Slab (over cabin) */}
        <group position={[-2.4, 0.9, 0.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.3, 0.15, 7.9]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.8} />
          </mesh>
          {/* Black Trim */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[5.45, 0.03, 8.05]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Roof Slab (over terrace) */}
        <group position={[2.8, 0.9, 0.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.3, 0.15, 7.9]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.8} />
          </mesh>
          {/* Black Trim */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[5.45, 0.03, 8.05]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Roof Chimney / Stair Cabin Structure */}
        <group position={[-1.0, 1.4, -0.6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.8, 1.8]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.8} />
          </mesh>
          {/* Chimney Trim */}
          <mesh position={[0, 0.41, 0]}>
            <boxGeometry args={[1.86, 0.03, 1.86]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 6. Landscape and garden beds */}
      <group ref={landscapeRef}>
        {/* Modern Airy Trees */}
        {[
          { pos: [-5.0, 0.46, 3.8], scale: 0.85 },   // Grows from Left Planter
          { pos: [-6.8, -1.82, 0.5], scale: 1.15 }, // Grows from Ground (Left)
          { pos: [4.8, 0.46, 3.8], scale: 0.8 },    // Grows from Right Planter
        ].map((tree, idx) => (
          <group key={idx} position={tree.pos} scale={[tree.scale, tree.scale, tree.scale]}>
            {/* Trunk */}
            <mesh castShadow position={[0, 1.1, 0]}>
              <cylinderGeometry args={[0.025, 0.045, 2.2, 8]} />
              <meshStandardMaterial map={barkTexture} roughness={0.9} />
            </mesh>
            {/* Canopy */}
            <group position={[0, 2.1, 0]}>
              <mesh castShadow position={[0, 0.0, 0]}>
                <sphereGeometry args={[0.55, 8, 8]} />
                <meshStandardMaterial color="#65A30D" roughness={0.9} flatShading />
              </mesh>
              <mesh castShadow position={[0.25, 0.25, 0.15]}>
                <sphereGeometry args={[0.45, 8, 8]} />
                <meshStandardMaterial color="#4D7C0F" roughness={0.9} flatShading />
              </mesh>
              <mesh castShadow position={[-0.25, 0.2, -0.2]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial color="#84CC16" roughness={0.9} flatShading />
              </mesh>
              <mesh castShadow position={[0.1, 0.4, -0.1]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshStandardMaterial color="#3F6212" roughness={0.9} flatShading />
              </mesh>
            </group>
          </group>
        ))}

        {/* Planter 1 Bushes (Front Left) */}
        <group position={[-4.4, 0.5, 3.8]}>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0, (i % 2 === 0 ? 0.15 : -0.15)]} castShadow>
              <sphereGeometry args={[0.4 + (i % 3) * 0.05, 8, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#65A30D" : "#4D7C0F"} roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>

        {/* Planter 2 Bushes (Front Right) */}
        <group position={[3.2, 0.5, 3.8]}>
          {[-2.5, -1.9, -1.3, -0.7, 0, 0.7, 1.3, 1.9, 2.5].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0, (i % 2 === 0 ? 0.12 : -0.12)]} castShadow>
              <sphereGeometry args={[0.38 + (i % 3) * 0.06, 8, 8]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#65A30D" : i % 3 === 1 ? "#4D7C0F" : "#84CC16"} roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>

        {/* Planter 3 Bushes (Right Side) */}
        <group position={[5.8, 0.5, -0.8]}>
          {[-3.0, -2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4, 3.0].map((zOffset, i) => (
            <mesh key={i} position={[(i % 2 === 0 ? 0.12 : -0.12), 0, zOffset]} castShadow>
              <sphereGeometry args={[0.38 + (i % 3) * 0.05, 8, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#4D7C0F" : "#3F6212"} roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>
      </group>

      {/* Dust Particles */}
      <DustParticles buildRef={buildRef} />

      {/* Interior & Ambient Lights */}
      <pointLight ref={light1Ref} position={[-1.2, 0.85, 1.5]} color="#FCD34D" intensity={0} distance={7} castShadow />
      <pointLight ref={light2Ref} position={[3.8, 0.85, 0.0]} color="#FCD34D" intensity={0} distance={5} />
      <pointLight ref={light3Ref} position={[-2.4, 1.4, 1.5]} color="#FCD34D" intensity={0} distance={6} />
      <pointLight ref={poolLightRef} position={[-1.8, 0.4, 4.1]} color="#FDE047" intensity={0} distance={5} />
    </group>
  );
}

/* ─── Main View Component ─── */
export default function ThreeDView() {
  const sectionRef = useRef(null);
  const buildRef   = useRef({ val: 0 });
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Section Content Fade-ins
    const contentAnim = gsap.fromTo('.tdv-content',
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
    );

    // Scroll control trigger (Pinning + Scrubbing)
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 1,
      id: 'threed-pin',
      onUpdate: (self) => {
        gsap.to(buildRef.current, { 
          val: self.progress, 
          duration: 0.2, 
          ease: 'none',
          onUpdate: () => {
            updateUI(buildRef.current.val);
          }
        });
      },
    });

    return () => {
      contentAnim.scrollTrigger?.kill();
      scrollTriggerInstance.kill();
    };
  }, []);

  const updateUI = (prog) => {
    const fill = document.getElementById('build-fill');
    if (fill) fill.style.width = `${prog * 100}%`;
  };

  return (
    <div className="tdv-section" ref={sectionRef}>
      <div className="tdv-bg">
        <div className="tdv-gradient" />
        <div className="tdv-bg-glow" />
      </div>

      <div className="tdv-inner">
        {/* Title */}
        <div className="tdv-content">
          <p className="section-label">Immersive 3D Construction</p>
          <h2 className="section-title">See Your Home Come<br/>to Life in 3D</h2>
          <p className="section-subtitle">
            Scroll to watch your home build in real-time — from blueprint to breathtaking 3D masterpiece with cinematic lighting.
          </p>
        </div>

        {/* Canvas */}
        <div className="tdv-canvas-wrap">
          <div className="tdv-canvas-frame">
            <Canvas
              shadows={{ type: THREE.PCFShadowMap }}
              camera={{ position: [12, 3, 11], fov: 44 }}
              gl={{ antialias: true, alpha: true }}
              ref={canvasRef}
            >
              <ambientLight intensity={1.3} color="#FFFFFF" />
              <directionalLight
                position={[15, 20, 12]}
                intensity={2.8}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                color="#FFFFFF"
              />
              <directionalLight position={[-10, 8, -6]} intensity={1.0} color="#F1F5F9" />
              <directionalLight position={[0, 12, 15]} intensity={0.5} color="#FFFFFF" />

              <Suspense fallback={null}>
                <HouseScene buildRef={buildRef} controlsRef={controlsRef} />
                <Environment preset="city" background={false} />
              </Suspense>

              <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                autoRotate={buildRef.current.val >= 0.98}
                autoRotateSpeed={0.4}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.3}
              />
            </Canvas>
          </div>

          {/* Progress bar */}
          <div className="build-progress-container">
            <div className="build-progress-track">
              <div className="build-progress-fill" id="build-fill" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
