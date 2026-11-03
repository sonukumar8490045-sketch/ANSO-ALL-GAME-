import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../../services/sound';
import { Target, Zap, Snowflake, Award, Crosshair, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FishingGame3DProps {
  userCoins: number;
  onCoinsChange: (newCoins: number) => void;
  onCatchRecord: (fishName: string, coinsEarned: number) => void;
}

interface FishActor {
  group: THREE.Group;
  type: 'guppy' | 'jellyfish' | 'shark' | 'ray' | 'nautilus';
  speed: number;
  value: number;
  radius: number;
  wiggleOffset: number;
  name: string;
  isBoss?: boolean;
}

interface Projectile {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  birth: number;
  netType: 'normal' | 'freeze' | 'thunder';
}

export const FishingGame3D: React.FC<FishingGame3DProps> = ({
  userCoins,
  onCoinsChange,
  onCatchRecord,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game state
  const [harpoonPower, setHarpoonPower] = useState<number>(20); // bet per shot
  const [score, setScore] = useState<number>(0);
  const [fishCount, setFishCount] = useState<number>(0);
  const [activeWeapon, setActiveWeapon] = useState<'normal' | 'freeze' | 'thunder'>('normal');
  const [freezeDuration, setFreezeDuration] = useState<number>(0);
  const [tournamentRank, setTournamentRank] = useState<number>(4);
  const [lastCatchInfo, setLastCatchInfo] = useState<{ text: string; coins: number } | null>(null);

  // References
  const turretGroupRef = useRef<THREE.Group | null>(null);
  const fishesRef = useRef<FishActor[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseScreenRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const pointerWorldTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -5));

  // Build fish procedural models
  const createFishMesh = useCallback((type: FishActor['type']): { group: THREE.Group; name: string; value: number; radius: number } => {
    const group = new THREE.Group();

    if (type === 'shark') {
      // 3D Cyber Shark (Boss: 50x multiplier)
      // 1. Torso
      const bodyGeo = new THREE.ConeGeometry(0.5, 2.2, 12);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = -Math.PI / 2;
      group.add(body);

      // 2. Dorsal Fin
      const finGeo = new THREE.BoxGeometry(0.1, 0.6, 0.4);
      const finMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, emissiveIntensity: 0.3 });
      const dorsal = new THREE.Mesh(finGeo, finMat);
      dorsal.position.set(-0.2, 0.5, 0);
      dorsal.rotation.z = -0.4;
      group.add(dorsal);

      // 3. Tail Fin
      const tailGeo = new THREE.ConeGeometry(0.4, 0.8, 6);
      const tail = new THREE.Mesh(tailGeo, finMat);
      tail.position.set(-1.3, 0, 0);
      tail.rotation.z = Math.PI / 2;
      group.add(tail);

      // 4. Cyber glowing eye
      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(0.7, 0.15, 0.3);
      group.add(eyeL);

      return { group, name: 'Cyber Megalodon', value: 50, radius: 1.1 };
    } else if (type === 'jellyfish') {
      // 3D Cyber Jellyfish (25x multiplier)
      // 1. Dome bell
      const bellGeo = new THREE.SphereGeometry(0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const bellMat = new THREE.MeshStandardMaterial({
        color: 0xbd00ff,
        emissive: 0xbd00ff,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      group.add(bell);

      // 2. Neon Tentacles
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const tentGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.7, 6);
        const tentMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(Math.cos(angle) * 0.25, -0.4, Math.sin(angle) * 0.25);
        group.add(tent);
      }

      return { group, name: 'Quantum Jellyfish', value: 25, radius: 0.6 };
    } else if (type === 'ray') {
      // 3D Electric Manta Ray (15x multiplier)
      const discGeo = new THREE.ConeGeometry(0.65, 1.2, 5);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00a8ff,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.3,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.scale.set(1.5, 0.2, 1.0);
      disc.rotation.z = -Math.PI / 2;
      group.add(disc);

      // Tail stinger
      const tailGeo = new THREE.CylinderGeometry(0.02, 0.05, 0.9, 6);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(-0.9, 0, 0);
      tail.rotation.z = Math.PI / 2;
      group.add(tail);

      return { group, name: 'Plasma Manta', value: 15, radius: 0.75 };
    } else if (type === 'nautilus') {
      // 3D Nautilus (10x multiplier)
      const shellGeo = new THREE.TorusGeometry(0.35, 0.18, 12, 18);
      const shellMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        metalness: 0.8,
        roughness: 0.2,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      group.add(shell);

      return { group, name: 'Chrono Nautilus', value: 10, radius: 0.5 };
    } else {
      // Neon Bioluminescent Guppy (4x multiplier)
      const bodyGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = -Math.PI / 2;
      group.add(body);

      const tailGeo = new THREE.ConeGeometry(0.15, 0.25, 4);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(-0.4, 0, 0);
      tail.rotation.z = Math.PI / 2;
      group.add(tail);

      return { group, name: 'Neon Guppy', value: 4, radius: 0.35 };
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    // Deep bioluminescent ocean background & fog
    scene.background = new THREE.Color(0x020817);
    scene.fog = new THREE.FogExp2(0x020817, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.replaceChildren(renderer.domElement);

    // Oceanic Lights
    const mainLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
    mainLight.position.set(0, 8, 4);
    scene.add(mainLight);

    const ambientOcean = new THREE.HemisphereLight(0x00f0ff, 0x050c22, 1.5);
    scene.add(ambientOcean);

    const deepGlow = new THREE.PointLight(0xbd00ff, 3, 15);
    deepGlow.position.set(0, -3, 0);
    scene.add(deepGlow);

    // Ocean Floor Grid & Coral Rocks
    const oceanFloor = new THREE.GridHelper(24, 24, 0x00f0ff, 0x091c3d);
    oceanFloor.position.y = -3.8;
    scene.add(oceanFloor);

    // Floating Bioluminescent Water Particles (Bubbles / plankton)
    const particleCount = 200;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      partPos[i] = (Math.random() - 0.5) * 16;
      partPos[i + 1] = (Math.random() - 0.5) * 10;
      partPos[i + 2] = (Math.random() - 0.5) * 12;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Harpoon Turret Cannon at Bottom Center
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, -3.2, 4);
    scene.add(turretGroup);

    // Turret Base
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 });
    const turretBase = new THREE.Mesh(baseGeo, baseMat);
    turretGroup.add(turretBase);

    // Turret Barrel (Double Plasma Cannons)
    const barrelGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.1, 12);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
    });
    const barrelL = new THREE.Mesh(barrelGeo, barrelMat);
    barrelL.position.set(-0.2, 0.5, 0);
    turretGroup.add(barrelL);

    const barrelR = new THREE.Mesh(barrelGeo, barrelMat);
    barrelR.position.set(0.2, 0.5, 0);
    turretGroup.add(barrelR);

    turretGroupRef.current = turretGroup;

    // Spawn Initial Fish Actors
    const fishTypes: FishActor['type'][] = [
      'shark',
      'jellyfish',
      'jellyfish',
      'ray',
      'ray',
      'nautilus',
      'guppy',
      'guppy',
      'guppy',
      'guppy',
    ];

    const actors: FishActor[] = [];
    fishTypes.forEach((type, idx) => {
      const data = createFishMesh(type);
      // Random starting positions spread in ocean depth
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 4;
      const z = -2 + (Math.random() - 0.5) * 6;
      data.group.position.set(x, y, z);
      scene.add(data.group);

      actors.push({
        group: data.group,
        type,
        speed: (type === 'guppy' ? 1.8 : type === 'shark' ? 0.9 : 1.2) * (Math.random() > 0.5 ? 1 : -1),
        value: data.value,
        radius: data.radius,
        wiggleOffset: Math.random() * Math.PI * 2,
        name: data.name,
        isBoss: type === 'shark',
      });
    });
    fishesRef.current = actors;

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Animate Plankton / Bubbles floating upward
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += delta * 0.4;
          if (positions[i] > 6) positions[i] = -4;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Swimming Fishes
      fishesRef.current.forEach((actor) => {
        // Move horizontally
        actor.group.position.x += actor.speed * delta;

        // Flip direction when hitting outer perimeter bounds
        if (actor.group.position.x > 8 && actor.speed > 0) {
          actor.speed = -Math.abs(actor.speed);
          actor.group.rotation.y = Math.PI;
        } else if (actor.group.position.x < -8 && actor.speed < 0) {
          actor.speed = Math.abs(actor.speed);
          actor.group.rotation.y = 0;
        }

        // Sinusoidal vertical undulation & swimming wiggle
        actor.group.position.y += Math.sin(time * 2 + actor.wiggleOffset) * 0.005;
        actor.group.rotation.z = Math.sin(time * 4 + actor.wiggleOffset) * 0.08;
      });

      // Animate Turret Rotation towards pointer target
      if (turretGroupRef.current) {
        const target = pointerWorldTargetRef.current;
        const angleY = Math.atan2(target.x - turretGroupRef.current.position.x, target.z - turretGroupRef.current.position.z);
        turretGroupRef.current.rotation.y = THREE.MathUtils.damp(turretGroupRef.current.rotation.y, angleY + Math.PI, 10, delta);
      }

      // Move & collide Projectiles
      const remainingProjectiles: Projectile[] = [];
      const now = performance.now();

      projectilesRef.current.forEach((proj) => {
        proj.mesh.position.addScaledVector(proj.direction, proj.speed * delta);

        // Check collision with any fish
        let hit = false;
        for (let i = 0; i < fishesRef.current.length; i++) {
          const fish = fishesRef.current[i];
          const dist = proj.mesh.position.distanceTo(fish.group.position);

          if (dist < fish.radius + 0.3) {
            // HIT FISH!
            hit = true;
            sound.playFishCatch(fish.isBoss);

            // Calculate payout
            const earnedCoins = harpoonPower * fish.value;
            setScore((prev) => prev + earnedCoins);
            setFishCount((prev) => prev + 1);
            setLastCatchInfo({ text: `CAPTURED ${fish.name.toUpperCase()}!`, coins: earnedCoins });
            onCoinsChange(userCoins + earnedCoins);
            onCatchRecord(fish.name, earnedCoins);

            if (fish.isBoss) {
              sound.playJackpot();
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            }

            // Respawn fish on far side
            fish.group.position.x = fish.speed > 0 ? -9 : 9;
            fish.group.position.y = (Math.random() - 0.5) * 4;
            break;
          }
        }

        // Remove projectile if hit or expired
        if (!hit && now - proj.birth < 2500) {
          remainingProjectiles.push(proj);
        } else {
          scene.remove(proj.mesh);
        }
      });
      projectilesRef.current = remainingProjectiles;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        window.setTimeout(() => {
          animationFrameId = requestAnimationFrame(tick);
        }, 50);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Mouse Move Aiming
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseScreenRef.current.set(x, y);
      raycasterRef.current.setFromCamera(mouseScreenRef.current, camera);

      // Raycast to z = 0 plane
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const target = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(plane, target);
      if (target) {
        pointerWorldTargetRef.current.copy(target);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [createFishMesh, harpoonPower, userCoins, onCoinsChange, onCatchRecord]);

  // Handle Fire Shot
  const handleFire = () => {
    if (userCoins < harpoonPower) {
      sound.playUiClick();
      setLastCatchInfo({ text: 'INSUFFICIENT COINS TO FIRE HARPOON!', coins: 0 });
      return;
    }

    // Deduct ammo coin cost
    onCoinsChange(userCoins - harpoonPower);
    sound.playLaserShot();

    if (!turretGroupRef.current) return;

    // Create 3D Plasma Net Bolt
    const boltGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const color = activeWeapon === 'freeze' ? 0x00f0ff : activeWeapon === 'thunder' ? 0xffea00 : 0x00ffaa;
    const boltMat = new THREE.MeshBasicMaterial({ color });
    const boltMesh = new THREE.Mesh(boltGeo, boltMat);

    // Start position at turret barrel
    const startPos = new THREE.Vector3(0, -2.6, 3.8);
    boltMesh.position.copy(startPos);

    // Target direction vector
    const dir = new THREE.Vector3().subVectors(pointerWorldTargetRef.current, startPos).normalize();

    if (turretGroupRef.current.parent) {
      turretGroupRef.current.parent.add(boltMesh);
      projectilesRef.current.push({
        mesh: boltMesh,
        direction: dir,
        speed: 14,
        birth: performance.now(),
        netType: activeWeapon,
      });
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Underwater Canvas */}
      <div
        ref={mountRef}
        onClick={handleFire}
        className="relative w-full max-w-4xl h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-[0_0_50px_rgba(0,240,255,0.2)] cursor-crosshair select-none"
      >
        {/* Top Low-Occlusion HUD */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="font-cyber text-xs tracking-wider text-cyan-300 uppercase">
              DEEP SEA 3D HARPOON
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30 font-tech text-xs text-purple-300">
              CATCHES: <span className="font-bold text-yellow-400 tabular-nums">{fishCount}</span>
            </div>
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/30 font-tech text-xs text-yellow-300 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              RANK: <span className="font-bold text-yellow-400">#3 GLOBAL</span>
            </div>
          </div>
        </div>

        {/* Dynamic Catch Alert Banner */}
        {lastCatchInfo && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-400 px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.5)] z-10 pointer-events-none text-center">
            <div className="font-cyber text-xs md:text-sm font-bold text-cyan-300">
              {lastCatchInfo.text}
            </div>
            {lastCatchInfo.coins > 0 && (
              <div className="font-cyber text-sm font-black text-yellow-400">
                +{lastCatchInfo.coins.toLocaleString()} COINS
              </div>
            )}
          </div>
        )}

        {/* Crosshair Cursor Overlay Hint */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-[11px] font-tech text-slate-400 pointer-events-none">
          🎯 CLICK ANYWHERE IN OCEAN TO FIRE PLASMA HARPOON
        </div>
      </div>

      {/* Ergonomic Consolidated Bottom Control Dock */}
      <div className="w-full max-w-4xl mt-3 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Harpoon Power / Ammo Bet Selector */}
          <div className="flex items-center gap-2">
            <span className="font-tech text-xs tracking-wider text-slate-400 font-semibold uppercase">
              AMMO COST:
            </span>
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 p-0.5">
              {[10, 20, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playUiClick();
                    setHarpoonPower(amt);
                  }}
                  className={`px-2.5 py-1 text-xs font-tech font-bold rounded-md transition ${
                    harpoonPower === amt
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Weapon Power-Ups */}
          <div className="flex items-center gap-2">
            <span className="font-tech text-xs tracking-wider text-slate-400 font-semibold uppercase">
              AMMO TYPE:
            </span>
            <button
              onClick={() => {
                sound.playUiClick();
                setActiveWeapon('normal');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-tech font-bold border transition ${
                activeWeapon === 'normal'
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              PLASMA NET (1x)
            </button>
            <button
              onClick={() => {
                sound.playUiClick();
                setActiveWeapon('freeze');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-tech font-bold border transition ${
                activeWeapon === 'freeze'
                  ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              CRYO FROST
            </button>
            <button
              onClick={() => {
                sound.playUiClick();
                setActiveWeapon('thunder');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-tech font-bold border transition ${
                activeWeapon === 'thunder'
                  ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              THUNDER WEB
            </button>
          </div>

          {/* Primary Quick Fire Trigger Button */}
          <button
            onClick={handleFire}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-cyber font-black tracking-wider text-sm bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,255,170,0.5)] active:scale-95 transition cursor-pointer"
          >
            <Crosshair className="w-4 h-4 fill-current" />
            FIRE ({harpoonPower})
          </button>
        </div>

        {/* Fish Multipliers Reference Guide */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-tech">
          <div className="flex items-center gap-4 overflow-x-auto py-1">
            <span className="text-cyan-400 font-bold uppercase">TARGET VALUES:</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span>🐟 Neon Guppy</span>
              <span className="text-green-400 font-bold">4X</span>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span>🐚 Chrono Nautilus</span>
              <span className="text-yellow-400 font-bold">10X</span>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span>⚡ Plasma Manta</span>
              <span className="text-cyan-400 font-bold">15X</span>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span>🪼 Quantum Jelly</span>
              <span className="text-purple-400 font-bold">25X</span>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2.5 py-0.5 rounded border border-yellow-500/50 bg-yellow-500/10">
              <span>🦈 Cyber Megalodon (Boss)</span>
              <span className="text-yellow-300 font-bold">50X</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
