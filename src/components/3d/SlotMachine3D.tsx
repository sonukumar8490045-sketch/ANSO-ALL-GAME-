import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { SlotThemeConfig } from '../../types';
import { sound } from '../../services/sound';
import { Play, Sparkles, Volume2, VolumeX, Zap, RefreshCw, Trophy, Flame } from 'lucide-react';

interface SlotMachine3DProps {
  theme: SlotThemeConfig;
  userCoins: number;
  onCoinsChange: (newCoins: number) => void;
  onRecordWin: (amount: number, bet: number) => void;
}

export const SlotMachine3D: React.FC<SlotMachine3DProps> = ({
  theme,
  userCoins,
  onCoinsChange,
  onRecordWin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Betting state
  const [bet, setBet] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [activePayline, setActivePayline] = useState<boolean>(false);

  // References to keep Three.js scene and reel state in sync
  const reelsRef = useRef<THREE.Mesh[]>([]);
  const leverArmRef = useRef<THREE.Group | null>(null);
  const paylineMeshRef = useRef<THREE.Mesh | null>(null);
  const marqueeTextMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const spinStateRef = useRef<{
    spinning: boolean;
    turbo: boolean;
    targetAngles: [number, number, number];
    currentAngles: [number, number, number];
    spinSpeeds: [number, number, number];
    stopTimes: [number, number, number];
    startTime: number;
    pulledLever: boolean;
    leverAngle: number;
  }>({
    spinning: false,
    turbo: false,
    targetAngles: [0, 0, 0],
    currentAngles: [0, 0, 0],
    spinSpeeds: [0, 0, 0],
    stopTimes: [0, 0, 0],
    startTime: 0,
    pulledLever: false,
    leverAngle: 0,
  });

  // Track symbol texture canvas generator
  const createReelTexture = useCallback((symbols: SlotThemeConfig['symbols'], primaryHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Background gradient for cylinder texture
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 1024);
    bgGrad.addColorStop(0, '#0a0d1e');
    bgGrad.addColorStop(0.5, '#141a36');
    bgGrad.addColorStop(1, '#0a0d1e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 1024);

    const numSymbols = symbols.length;
    const slotHeight = 1024 / numSymbols;

    symbols.forEach((sym, idx) => {
      const y = idx * slotHeight;

      // Divider lines
      ctx.strokeStyle = primaryHex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(502, y);
      ctx.stroke();

      // Cyber glow frame for each symbol slot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(20, y + 10, 472, slotHeight - 20);

      // Neon symbol box
      ctx.strokeStyle = sym.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, y + 15, 452, slotHeight - 30);

      // Draw Symbol Icon (Emoji / Icon glyph)
      ctx.font = 'bold 72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sym.icon, 256, y + slotHeight * 0.42);

      // Draw Symbol Label with glow
      ctx.font = 'bold 26px Orbitron, sans-serif';
      ctx.fillStyle = sym.color;
      ctx.shadowColor = sym.color;
      ctx.shadowBlur = 10;
      ctx.fillText(sym.label.toUpperCase(), 256, y + slotHeight * 0.78);

      // Multiplier badge
      ctx.font = '600 18px Rajdhani, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(`${sym.payout}X`, 256, y + slotHeight * 0.92);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

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
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(
      new THREE.Color(theme.primaryColor),
      0x050711,
      1.2
    );
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight(new THREE.Color(theme.accentColor), 3, 8);
    rimLight.position.set(-2.5, 1.5, 1);
    scene.add(rimLight);

    // Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.3;
    scene.add(shadowMesh);

    // ==========================================
    // 3D SLOT MACHINE CABINET (MULTI-PART GROUP)
    // ==========================================
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);

    // 1. Main Cabinet Chassis
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f24,
      metalness: 0.85,
      roughness: 0.25,
    });
    const cabinetGeo = new THREE.BoxGeometry(2.4, 2.3, 1.1);
    const cabinetMesh = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinetMesh.position.set(0, 0, -0.1);
    cabinetMesh.castShadow = !isSoftwareGl;
    cabinetMesh.receiveShadow = !isSoftwareGl;
    machineGroup.add(cabinetMesh);

    // 2. Beveled Neon Frame Border
    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.primaryColor),
      emissive: new THREE.Color(theme.primaryColor),
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.15,
    });
    const frameGeo = new THREE.BoxGeometry(2.46, 2.36, 0.1);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, 0.45);
    machineGroup.add(frameMesh);

    // 3. Reel Window Cutout (Dark Interior recess)
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x03050c });
    const windowGeo = new THREE.BoxGeometry(1.95, 1.1, 0.3);
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0, 0.05, 0.42);
    machineGroup.add(windowMesh);

    // 4. Marquee Header (Top LED Display)
    const marqueeGeo = new THREE.BoxGeometry(2.1, 0.5, 0.2);
    const marqueeMat = new THREE.MeshStandardMaterial({
      color: 0x050714,
      metalness: 0.9,
      roughness: 0.2,
    });
    const marqueeMesh = new THREE.Mesh(marqueeGeo, marqueeMat);
    marqueeMesh.position.set(0, 0.95, 0.45);
    machineGroup.add(marqueeMesh);

    // Marquee neon text glow panel
    const canvasMarquee = document.createElement('canvas');
    canvasMarquee.width = 512;
    canvasMarquee.height = 128;
    const mCtx = canvasMarquee.getContext('2d')!;
    mCtx.fillStyle = '#060a1e';
    mCtx.fillRect(0, 0, 512, 128);
    mCtx.font = 'bold 36px Orbitron, sans-serif';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillStyle = theme.accentColor;
    mCtx.shadowColor = theme.primaryColor;
    mCtx.shadowBlur = 12;
    mCtx.fillText(theme.name.toUpperCase(), 256, 64);

    const marqueeTex = new THREE.CanvasTexture(canvasMarquee);
    marqueeTex.colorSpace = THREE.SRGBColorSpace;
    const marqueeTextMat = new THREE.MeshBasicMaterial({
      map: marqueeTex,
      transparent: true,
    });
    marqueeTextMatRef.current = marqueeTextMat;
    const marqueeSignGeo = new THREE.PlaneGeometry(1.9, 0.42);
    const marqueeSign = new THREE.Mesh(marqueeSignGeo, marqueeTextMat);
    marqueeSign.position.set(0, 0.95, 0.56);
    machineGroup.add(marqueeSign);

    // 5. Three Spinning Cylindrical Reels
    const reelTexture = createReelTexture(theme.symbols, theme.primaryColor);
    const reelRadius = 0.45;
    const reelWidth = 0.55;
    const reelGeo = new THREE.CylinderGeometry(reelRadius, reelRadius, reelWidth, 32, 1, false);
    const reelMat = new THREE.MeshStandardMaterial({
      map: reelTexture,
      metalness: 0.3,
      roughness: 0.35,
    });

    const reels: THREE.Mesh[] = [];
    const reelXPositions = [-0.62, 0, 0.62];

    reelXPositions.forEach((xPos) => {
      const reel = new THREE.Mesh(reelGeo, reelMat);
      reel.rotation.z = Math.PI / 2; // Orient cylinder horizontally
      reel.position.set(xPos, 0.05, 0.28);
      machineGroup.add(reel);
      reels.push(reel);
    });
    reelsRef.current = reels;

    // 6. Payline Neon Laser Indicator Mesh
    const paylineGeo = new THREE.BoxGeometry(1.9, 0.04, 0.04);
    const paylineMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
    });
    const paylineMesh = new THREE.Mesh(paylineGeo, paylineMat);
    paylineMesh.position.set(0, 0.05, 0.56);
    machineGroup.add(paylineMesh);
    paylineMeshRef.current = paylineMesh;

    // 7. Mechanical Arm Lever on the Right
    const leverGroup = new THREE.Group();
    leverGroup.position.set(1.22, 0.05, 0.2);
    machineGroup.add(leverGroup);

    // Lever base socket
    const socketGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e243d, metalness: 0.9, roughness: 0.2 });
    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    socketMesh.rotation.z = Math.PI / 2;
    leverGroup.add(socketMesh);

    // Lever rod
    const rodGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.6, 12);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xc0c8db, metalness: 0.95, roughness: 0.1 });
    const rodMesh = new THREE.Mesh(rodGeo, rodMat);
    rodMesh.position.set(0.12, 0.28, 0);
    rodMesh.rotation.z = -0.15;
    leverGroup.add(rodMesh);

    // Lever knob handle (Glow sphere)
    const knobGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const knobMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.primaryColor),
      emissive: new THREE.Color(theme.primaryColor),
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });
    const knobMesh = new THREE.Mesh(knobGeo, knobMat);
    knobMesh.position.set(0.18, 0.58, 0);
    leverGroup.add(knobMesh);
    leverArmRef.current = leverGroup;

    // Subtle ambient floor grid
    const gridHelper = new THREE.GridHelper(10, 20, new THREE.Color(theme.primaryColor), 0x14182f);
    gridHelper.position.y = -1.3;
    scene.add(gridHelper);

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const st = spinStateRef.current;

      // Spin rotation physics
      if (reelsRef.current.length === 3) {
        const now = performance.now();

        reelsRef.current.forEach((reel, idx) => {
          if (st.spinning) {
            const timeSinceStop = now - st.stopTimes[idx];
            if (timeSinceStop < 0) {
              // Still actively spinning
              const speed = st.turbo ? 28 : 18;
              reel.rotation.x += speed * delta;
            } else {
              // Stopping: smooth exponential damping to target angle
              const diff = st.targetAngles[idx] - reel.rotation.x;
              if (Math.abs(diff) > 0.01) {
                reel.rotation.x += diff * Math.min(delta * 14, 1.0);
              } else {
                reel.rotation.x = st.targetAngles[idx];
              }
            }
          }
        });

        // Lever bounce animation
        if (leverArmRef.current) {
          if (st.pulledLever) {
            st.leverAngle = THREE.MathUtils.damp(st.leverAngle, 0.8, 12, delta);
            if (st.leverAngle > 0.75) {
              st.pulledLever = false;
            }
          } else {
            st.leverAngle = THREE.MathUtils.damp(st.leverAngle, 0, 10, delta);
          }
          leverArmRef.current.rotation.x = st.leverAngle;
        }

        // Check if all reels settled
        if (st.spinning && now > st.stopTimes[2] + 400) {
          st.spinning = false;
          setIsSpinning(false);
        }
      }

      // Gentle floating sway for machine
      const time = clock.getElapsedTime();
      machineGroup.position.y = Math.sin(time * 1.5) * 0.02;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        // Safe paced callback for software WebGL
        window.setTimeout(() => {
          animationFrameId = requestAnimationFrame(tick);
        }, 50);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [theme, createReelTexture]);

  // Execute Spin Action
  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    if (userCoins < bet && freeSpinsLeft <= 0) {
      sound.playUiClick();
      setWinMessage('INSUFFICIENT COINS! Recharging via Wallet recommended.');
      return;
    }

    // Deduct coins if not free spin
    if (freeSpinsLeft > 0) {
      setFreeSpinsLeft((prev) => prev - 1);
    } else {
      onCoinsChange(userCoins - bet);
    }

    setIsSpinning(true);
    setWinMessage(null);
    setActivePayline(false);

    // Audio and lever feedback
    sound.playSpinStart();
    const st = spinStateRef.current;
    st.spinning = true;
    st.pulledLever = true;
    st.turbo = isTurbo;
    const now = performance.now();
    st.startTime = now;

    // Reel spin durations
    const baseDuration = isTurbo ? 600 : 1200;
    st.stopTimes = [
      now + baseDuration,
      now + baseDuration + (isTurbo ? 250 : 500),
      now + baseDuration + (isTurbo ? 500 : 1000),
    ];

    // Play stop sound per reel
    setTimeout(() => sound.playReelStop(0), baseDuration);
    setTimeout(() => sound.playReelStop(1), baseDuration + (isTurbo ? 250 : 500));
    setTimeout(() => sound.playReelStop(2), baseDuration + (isTurbo ? 500 : 1000));

    // Determine outcome based on RTP probability
    const symbols = theme.symbols;
    const isWin = Math.random() < 0.45; // ~45% hit frequency
    let outcomeSymbols: [number, number, number];

    if (isWin) {
      // Pick a winning symbol index
      const winSymbolIdx = Math.floor(Math.random() * symbols.length);
      outcomeSymbols = [winSymbolIdx, winSymbolIdx, winSymbolIdx];
    } else {
      // Near miss or mixed symbols
      const sym1 = Math.floor(Math.random() * symbols.length);
      const sym2 = Math.floor(Math.random() * symbols.length);
      let sym3 = Math.floor(Math.random() * symbols.length);
      if (sym1 === sym2 && sym2 === sym3) {
        sym3 = (sym3 + 1) % symbols.length;
      }
      outcomeSymbols = [sym1, sym2, sym3];
    }

    // Set target angles for Three.js cylinder rotation
    const numSymbols = symbols.length;
    const angleStep = (Math.PI * 2) / numSymbols;

    outcomeSymbols.forEach((symIdx, i) => {
      const current = reelsRef.current[i] ? reelsRef.current[i].rotation.x : 0;
      // Add extra full spins (3-5 rotations) then snap to exact symbol segment
      const extraRotations = (isTurbo ? 3 : 5) * Math.PI * 2;
      const targetSegmentAngle = symIdx * angleStep;
      // Round to nearest multiple so rotation keeps progressing forward
      const target = Math.ceil(current / (Math.PI * 2)) * (Math.PI * 2) + extraRotations + targetSegmentAngle;
      st.targetAngles[i] = target;
    });

    // Handle Win Resolution when all reels stop
    const finishDelay = baseDuration + (isTurbo ? 550 : 1100);
    setTimeout(() => {
      if (outcomeSymbols[0] === outcomeSymbols[1] && outcomeSymbols[1] === outcomeSymbols[2]) {
        const winningSym = symbols[outcomeSymbols[0]];
        const winPayout = bet * winningSym.payout;
        setLastWin(winPayout);
        setActivePayline(true);

        if (paylineMeshRef.current) {
          (paylineMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
        }

        if (winningSym.payout >= 35) {
          // Mega Jackpot
          sound.playJackpot();
          setWinMessage(`🔥 MEGA QUANTUM WIN! ${winPayout.toLocaleString()} COINS (${winningSym.payout}X) 🔥`);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#bd00ff', '#ffd700'],
          });
        } else {
          // Standard Win
          sound.playWin(winningSym.payout);
          setWinMessage(`WINNER! +${winPayout.toLocaleString()} COINS (${winningSym.label})`);
        }

        onCoinsChange(userCoins - (freeSpinsLeft > 0 ? 0 : bet) + winPayout);
        onRecordWin(winPayout, bet);
      } else {
        setLastWin(0);
        if (paylineMeshRef.current) {
          (paylineMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15;
        }
      }
    }, finishDelay);
  }, [isSpinning, userCoins, bet, freeSpinsLeft, isTurbo, theme, onCoinsChange, onRecordWin]);

  // Auto-Spin Watcher
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning && userCoins >= bet) {
      timer = setTimeout(() => {
        handleSpin();
      }, 900);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, userCoins, bet, handleSpin]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Slot Canvas Container */}
      <div className="relative w-full max-w-4xl h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div ref={mountRef} className="w-full h-full" />

        {/* Top Minimal Spec Bar */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="font-cyber text-xs tracking-wider text-cyan-300 uppercase">
              {theme.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30 font-tech text-xs text-purple-300">
              VOLATILITY: <span className="font-bold text-yellow-400">{theme.volatility}</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 font-tech text-xs text-cyan-300">
              RTP: <span className="font-bold text-green-400">{theme.rtp}</span>
            </div>
          </div>
        </div>

        {/* Floating Win Notification Banner */}
        {winMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-900/90 via-cyan-900/90 to-purple-900/90 border border-yellow-400/80 px-6 py-2.5 rounded-xl shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-bounce text-center z-10 pointer-events-none">
            <div className="font-cyber text-sm md:text-base font-bold text-yellow-300 text-glow-gold">
              {winMessage}
            </div>
          </div>
        )}

        {/* 3D Pull Lever Quick Click Overlay (Right Side of Screen) */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          aria-label="Pull 3D Lever"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-36 rounded-xl bg-gradient-to-b from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/25 hover:to-purple-500/25 border border-cyan-400/30 flex flex-col items-center justify-center gap-2 group transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-400 group-hover:bg-cyan-300 shadow-[0_0_15px_#00f0ff] flex items-center justify-center text-slate-950 font-bold text-xs">
            PULL
          </div>
          <span className="font-tech text-[10px] text-cyan-300 font-semibold tracking-wider uppercase rotate-90">
            LEVER
          </span>
        </button>
      </div>

      {/* Ergonomic Collapsible Bottom Control Dock (Consolidated, Zero Occlusion) */}
      <div className="w-full max-w-4xl mt-3 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Bet Selector */}
          <div className="flex items-center gap-2">
            <span className="font-tech text-xs tracking-wider text-slate-400 font-semibold uppercase">
              BET:
            </span>
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 p-0.5">
              {[25, 50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    sound.playUiClick();
                    setBet(amount);
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 text-xs font-tech font-bold rounded-md transition ${
                    bet === amount
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                sound.playUiClick();
                setBet(1000);
              }}
              disabled={isSpinning}
              className={`px-2.5 py-1 text-xs font-cyber font-bold rounded-md border ${
                bet === 1000
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                  : 'border-yellow-500/40 text-yellow-400/80 hover:border-yellow-400'
              }`}
            >
              MAX
            </button>
          </div>

          {/* Win / Balance Readout */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-tech text-[10px] tracking-wider text-slate-400 uppercase">LAST WIN</div>
              <div className="font-cyber font-bold text-sm text-yellow-400 tabular-nums">
                {lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-tech text-[10px] tracking-wider text-slate-400 uppercase">BALANCE</div>
              <div className="font-cyber font-bold text-sm text-cyan-400 tabular-nums">
                {userCoins.toLocaleString()} <span className="text-[10px] text-cyan-200">COINS</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Turbo, Auto, and Primary Spin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playUiClick();
                setIsTurbo(!isTurbo);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-tech font-bold border transition ${
                isTurbo
                  ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(189,0,255,0.4)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              TURBO
            </button>

            <button
              onClick={() => {
                sound.playUiClick();
                setIsAutoSpin(!isAutoSpin);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-tech font-bold border transition ${
                isAutoSpin
                  ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              AUTO
            </button>

            {/* Giant Futuristic SPIN CTA Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-cyber font-black tracking-wider text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>
        </div>

        {/* Payout Reference Row */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-tech">
          <div className="flex items-center gap-4 overflow-x-auto py-1">
            <span className="text-cyan-400 font-bold uppercase">PAYTABLE:</span>
            {theme.symbols.map((sym) => (
              <span key={sym.id} className="inline-flex items-center gap-1 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                <span>{sym.icon}</span>
                <span className="text-slate-300">{sym.label}</span>
                <span className="text-yellow-400 font-bold">{sym.payout}X</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
