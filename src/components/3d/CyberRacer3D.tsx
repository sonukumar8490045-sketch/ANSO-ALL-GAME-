import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from '../../services/sound';
import { Play, Sparkles, Zap, Shield, Trophy, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CyberRacer3DProps {
  userCoins: number;
  onCoinsChange: (coins: number) => void;
  onRecordWin: (amount: number, bet: number) => void;
}

export const CyberRacer3D: React.FC<CyberRacer3DProps> = ({
  userCoins,
  onCoinsChange,
  onRecordWin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Betting & Game State
  const [entryBet, setEntryBet] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [shields, setShields] = useState<number>(3);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  // References for Three.js objects
  const shipGroupRef = useRef<THREE.Group | null>(null);
  const targetXRef = useRef<number>(0);
  const targetYRef = useRef<number>(0);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const obstaclesRef = useRef<{ mesh: THREE.Mesh; active: boolean; type: 'hazard' | 'coin' }[]>([]);
  const thrusterGlowRef = useRef<THREE.PointLight | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Three.js Mount Setup
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
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040612);
    scene.fog = new THREE.FogExp2(0x040612, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 0, -8);

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

    // Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lights
    const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const ambientLight = new THREE.HemisphereLight(0x00f0ff, 0x050711, 1.2);
    scene.add(ambientLight);

    const thrusterLight = new THREE.PointLight(0x00ffff, 4, 8);
    thrusterLight.position.set(0, 0, 1.5);
    scene.add(thrusterLight);
    thrusterGlowRef.current = thrusterLight;

    // ==========================================
    // 3D PROCEDURAL PLAYER STARSHIP (COMPOSITE)
    // ==========================================
    const shipGroup = new THREE.Group();
    shipGroup.position.set(0, 0, 0);
    scene.add(shipGroup);
    shipGroupRef.current = shipGroup;

    // 1. Fuselage Hull
    const hullGeo = new THREE.ConeGeometry(0.35, 1.4, 6);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = -Math.PI / 2;
    shipGroup.add(hull);

    // 2. Cockpit Canopy Glass
    const cockpitGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.15, -0.1);
    cockpit.scale.set(0.8, 0.6, 1.8);
    shipGroup.add(cockpit);

    // 3. Swept Delta Wings
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.2,
    });

    const wingLGeo = new THREE.BoxGeometry(0.8, 0.04, 0.6);
    const wingL = new THREE.Mesh(wingLGeo, wingMat);
    wingL.position.set(-0.6, -0.05, 0.1);
    wingL.rotation.y = -0.3;
    shipGroup.add(wingL);

    const wingRGeo = new THREE.BoxGeometry(0.8, 0.04, 0.6);
    const wingR = new THREE.Mesh(wingRGeo, wingMat);
    wingR.position.set(0.6, -0.05, 0.1);
    wingR.rotation.y = 0.3;
    shipGroup.add(wingR);

    // 4. Plasma Wingtip Lasers
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const tipL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), tipMat);
    tipL.rotation.x = Math.PI / 2;
    tipL.position.set(-1.0, -0.05, 0);
    shipGroup.add(tipL);

    const tipR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), tipMat);
    tipR.rotation.x = Math.PI / 2;
    tipR.position.set(1.0, -0.05, 0);
    shipGroup.add(tipR);

    // 5. Thruster Nozzles
    const nozzleMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const nozzleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8), nozzleMat);
    nozzleL.rotation.x = Math.PI / 2;
    nozzleL.position.set(-0.2, 0, 0.7);
    shipGroup.add(nozzleL);

    const nozzleR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8), nozzleMat);
    nozzleR.rotation.x = Math.PI / 2;
    nozzleR.position.set(0.2, 0, 0.7);
    shipGroup.add(nozzleR);

    // ==========================================
    // WARP TUNNEL NEON RINGS & OBSTACLES
    // ==========================================
    const rings: THREE.Mesh[] = [];
    const ringGeo = new THREE.TorusGeometry(3.2, 0.04, 8, 32);

    for (let i = 0; i < 15; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0xbd00ff,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, -i * 5);
      scene.add(ring);
      rings.push(ring);
    }
    ringsRef.current = rings;

    // Obstacles pool (Lasers / Quantum Pylons / Gold Orbs)
    const obstacles: { mesh: THREE.Mesh; active: boolean; type: 'hazard' | 'coin' }[] = [];
    const hazardGeo = new THREE.BoxGeometry(1.6, 0.2, 0.2);
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    const coinGeo = new THREE.OctahedronGeometry(0.35);
    const coinMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    for (let i = 0; i < 12; i++) {
      const isCoin = i % 3 === 0;
      const mesh = new THREE.Mesh(isCoin ? coinGeo : hazardGeo, isCoin ? coinMat : hazardMat);
      mesh.position.set(
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 2.2,
        -15 - i * 6
      );
      scene.add(mesh);
      obstacles.push({ mesh, active: true, type: isCoin ? 'coin' : 'hazard' });
    }
    obstaclesRef.current = obstacles;

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Update Ship Position with smooth spring damping towards mouse target
      if (shipGroupRef.current) {
        const tx = targetXRef.current * 2.2;
        const ty = targetYRef.current * 1.4;

        shipGroupRef.current.position.x = THREE.MathUtils.damp(shipGroupRef.current.position.x, tx, 10, delta);
        shipGroupRef.current.position.y = THREE.MathUtils.damp(shipGroupRef.current.position.y, ty, 10, delta);

        // Bank ship banking roll when turning
        const targetRoll = -targetXRef.current * 0.8;
        shipGroupRef.current.rotation.z = THREE.MathUtils.damp(shipGroupRef.current.rotation.z, targetRoll, 8, delta);
        shipGroupRef.current.rotation.x = targetYRef.current * 0.3;

        // Subtle idle vibration
        shipGroupRef.current.position.y += Math.sin(time * 15) * 0.003;
      }

      // If active game is running, advance tunnel and obstacles
      if (isPlayingRef.current) {
        const speed = 24; // Warp flight speed

        // Move Tunnel Rings towards camera
        ringsRef.current.forEach((ring) => {
          ring.position.z += speed * delta;
          if (ring.position.z > 5) {
            ring.position.z = -70;
          }
        });

        // Move Obstacles towards camera & check collision
        obstaclesRef.current.forEach((obs) => {
          obs.mesh.position.z += speed * delta;
          obs.mesh.rotation.y += 2 * delta;

          // Check collision with ship
          if (shipGroupRef.current && obs.active) {
            const shipPos = shipGroupRef.current.position;
            const dist = obs.mesh.position.distanceTo(shipPos);

            if (dist < 0.9) {
              obs.active = false;
              obs.mesh.visible = false;

              if (obs.type === 'coin') {
                // Collected gold cyber-orb
                sound.playCoinDing();
                setCoinsCollected((prev) => prev + 1);
              } else {
                // Hit energy barrier hazard!
                sound.playUiClick();
                setShields((prev) => {
                  const nextShields = prev - 1;
                  if (nextShields <= 0) {
                    // Game Over
                    handleCrashFinish();
                  }
                  return Math.max(0, nextShields);
                });
              }
            }
          }

          // Recycle obstacle once past camera
          if (obs.mesh.position.z > 5) {
            obs.mesh.position.z = -70 - Math.random() * 20;
            obs.mesh.position.x = (Math.random() - 0.5) * 3.5;
            obs.mesh.position.y = (Math.random() - 0.5) * 2.2;
            obs.active = true;
            obs.mesh.visible = true;
          }
        });
      }

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

    // Mouse / Touch Steering
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetXRef.current = Math.max(-1, Math.min(1, x));
      targetYRef.current = Math.max(-1, Math.min(1, y));
    };

    container.addEventListener('mousemove', handlePointerMove);

    // Keyboard Arrow Keys Steering
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') targetXRef.current = Math.max(-1, targetXRef.current - 0.3);
      if (e.key === 'ArrowRight' || e.key === 'd') targetXRef.current = Math.min(1, targetXRef.current + 0.3);
      if (e.key === 'ArrowUp' || e.key === 'w') targetYRef.current = Math.min(1, targetYRef.current + 0.3);
      if (e.key === 'ArrowDown' || e.key === 's') targetYRef.current = Math.max(-1, targetYRef.current - 0.3);
    };

    window.addEventListener('keydown', handleKeyDown);

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Distance & Multiplier Accumulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameOver) {
      interval = setInterval(() => {
        setDistance((prev) => prev + 10);
        setMultiplier((prev) => Number((prev + 0.05).toFixed(2)));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  // Start Flight Action
  const handleStartFlight = () => {
    if (userCoins < entryBet) {
      sound.playUiClick();
      setWinMessage('INSUFFICIENT COINS! Recharge via Wallet.');
      return;
    }

    onCoinsChange(userCoins - entryBet);
    sound.playSpinStart();
    setIsPlaying(true);
    setGameOver(false);
    setDistance(0);
    setMultiplier(1.0);
    setShields(3);
    setCoinsCollected(0);
    setWinMessage(null);
  };

  // Cash Out Warp Distance
  const handleCashOut = () => {
    if (!isPlaying || gameOver) return;
    const finalPayout = Math.round(entryBet * multiplier + coinsCollected * 50);
    sound.playJackpot();
    setIsPlaying(false);
    setGameOver(true);
    setWinMessage(`WARP RUN COMPLETED! Cashout: +${finalPayout.toLocaleString()} COINS (${multiplier}X)`);
    onCoinsChange(userCoins + finalPayout);
    onRecordWin(finalPayout, entryBet);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Ship Crash / Shields Depleted
  const handleCrashFinish = () => {
    sound.playUiClick();
    setIsPlaying(false);
    setGameOver(true);
    const rescueCoins = coinsCollected * 25;
    if (rescueCoins > 0) {
      onCoinsChange(userCoins + rescueCoins);
      setWinMessage(`SHIELDS COLLAPSED! Salvaged ${rescueCoins} coins from collected orbs.`);
    } else {
      setWinMessage('WARP CRASH! Energy barriers overwhelmed starship shields.');
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Canvas Viewport */}
      <div className="relative w-full max-w-4xl h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-[0_0_50px_rgba(0,240,255,0.2)] select-none">
        <div ref={mountRef} className="w-full h-full cursor-crosshair" />

        {/* Top Minimal HUD */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="font-cyber text-xs tracking-wider text-cyan-300 uppercase">
              3D CYBER SPACE RACER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 font-tech text-xs text-cyan-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHIELDS:</span>
              <span className="font-cyber font-bold text-yellow-400">{shields} / 3</span>
            </div>
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30 font-tech text-xs text-purple-300">
              DISTANCE: <span className="font-bold text-yellow-400 tabular-nums">{distance}M</span>
            </div>
          </div>
        </div>

        {/* Live Multiplier Meter Center Overlay */}
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-400 px-6 py-2 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.5)] z-10 pointer-events-none text-center">
            <span className="font-tech text-[10px] text-cyan-300 block uppercase tracking-wider">
              CURRENT WARP MULTIPLIER
            </span>
            <span className="font-cyber text-3xl font-black text-yellow-400 text-glow-gold tabular-nums">
              {multiplier.toFixed(2)}x
            </span>
            <div className="font-tech text-xs text-emerald-400 font-bold mt-0.5">
              EST. CASHOUT: {Math.round(entryBet * multiplier + coinsCollected * 50).toLocaleString()} COINS
            </div>
          </div>
        )}

        {/* Dynamic Win / Crash Notification Banner */}
        {winMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-900/95 via-cyan-900/95 to-purple-900/95 border border-yellow-400 px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.6)] z-20 pointer-events-none text-center max-w-md">
            <div className="font-cyber text-sm md:text-base font-bold text-yellow-300 text-glow-gold">
              {winMessage}
            </div>
          </div>
        )}

        {/* Flight Hint Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-[11px] font-tech text-slate-400 pointer-events-none">
          🛸 MOVE MOUSE OR WASD TO STEER · AVOID RED HAZARDS · COLLECT GOLD ORBS
        </div>
      </div>

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <div className="w-full max-w-4xl mt-3 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Bet Selector */}
          <div className="flex items-center gap-2">
            <span className="font-tech text-xs tracking-wider text-slate-400 font-semibold uppercase">
              WARP ENTRY:
            </span>
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 p-0.5">
              {[25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playUiClick();
                    setEntryBet(amt);
                  }}
                  disabled={isPlaying}
                  className={`px-2.5 py-1 text-xs font-tech font-bold rounded-md transition ${
                    entryBet === amt
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Readout Status */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-tech text-[10px] tracking-wider text-slate-400 uppercase">ORBS CAPTURED</div>
              <div className="font-cyber font-bold text-sm text-yellow-400 tabular-nums">
                {coinsCollected} (+{coinsCollected * 50})
              </div>
            </div>
            <div className="text-right">
              <div className="font-tech text-[10px] tracking-wider text-slate-400 uppercase">YOUR BALANCE</div>
              <div className="font-cyber font-bold text-sm text-cyan-400 tabular-nums">
                {userCoins.toLocaleString()} <span className="text-[10px] text-cyan-200">COINS</span>
              </div>
            </div>
          </div>

          {/* Flight CTA Actions */}
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={handleStartFlight}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-cyber font-black tracking-wider text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                LAUNCH WARP RUN ({entryBet})
              </button>
            ) : (
              <button
                onClick={handleCashOut}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-cyber font-black tracking-wider text-sm bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition cursor-pointer animate-pulse"
              >
                <Zap className="w-4 h-4 fill-current" />
                CASH OUT ({Math.round(entryBet * multiplier + coinsCollected * 50).toLocaleString()} COINS)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
