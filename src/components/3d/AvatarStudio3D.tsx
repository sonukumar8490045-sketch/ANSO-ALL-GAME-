import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AvatarCustomization, UserProfile } from '../../types';
import { sound } from '../../services/sound';
import { Shield, Sparkles, Check, RotateCw, Palette, User, Crown, Eye } from 'lucide-react';

interface AvatarStudio3DProps {
  profile: UserProfile;
  onSaveAvatar: (avatar: AvatarCustomization) => void;
}

export const AvatarStudio3D: React.FC<AvatarStudio3DProps> = ({ profile, onSaveAvatar }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [avatar, setAvatar] = useState<AvatarCustomization>(profile.avatar);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chassis' | 'hair' | 'outfit' | 'visor' | 'accessories'>('chassis');

  // Three.js object references for dynamic material / mesh updates
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const wingsMeshRef = useRef<THREE.Mesh | null>(null);
  const coreReactorRef = useRef<THREE.Mesh | null>(null);

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

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a1a);
    scene.fog = new THREE.FogExp2(0x070a1a, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 4.0);

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

    // Environment reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(new THREE.Color(avatar.glowColor), 3, 8);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    const ambientLight = new THREE.HemisphereLight(0x00f0ff, 0x050711, 1.2);
    scene.add(ambientLight);

    // Circular Holographic Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    scene.add(pedestal);

    // Pedestal Neon Ring
    const ringGeo = new THREE.TorusGeometry(1.22, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(avatar.glowColor) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.0;
    scene.add(ring);

    // ==========================================
    // 3D CYBORG CHARACTER (MULTI-PART COMPOSITE)
    // ==========================================
    const charGroup = new THREE.Group();
    charGroup.position.y = -0.9;
    scene.add(charGroup);
    avatarGroupRef.current = charGroup;

    // Chassis Material configuration
    const getChassisMat = () => {
      let color = 0x1e293b;
      let metalness = 0.9;
      let roughness = 0.2;

      if (avatar.chassis === 'titanium') {
        color = 0xd1d5db;
        metalness = 0.95;
        roughness = 0.15;
      } else if (avatar.chassis === 'obsidian') {
        color = 0x111827;
        metalness = 0.95;
        roughness = 0.1;
      } else if (avatar.chassis === 'synth_blue') {
        color = 0x0284c7;
        metalness = 0.8;
        roughness = 0.25;
      } else if (avatar.chassis === 'rose_gold') {
        color = 0xf43f5e;
        metalness = 0.9;
        roughness = 0.18;
      }
      return new THREE.MeshStandardMaterial({ color, metalness, roughness });
    };

    const chassisMat = getChassisMat();
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(avatar.glowColor) });

    // 1. Torso / Exo-Chest
    const chestGeo = new THREE.BoxGeometry(0.65, 0.75, 0.4);
    const chest = new THREE.Mesh(chestGeo, chassisMat);
    chest.position.set(0, 1.1, 0);
    charGroup.add(chest);

    // Arc Core Reactor on chest
    const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
    const coreMesh = new THREE.Mesh(coreGeo, glowMat);
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, 1.18, 0.22);
    charGroup.add(coreMesh);
    coreReactorRef.current = coreMesh;

    // 2. Head
    const headGeo = new THREE.BoxGeometry(0.38, 0.44, 0.38);
    const head = new THREE.Mesh(headGeo, chassisMat);
    head.position.set(0, 1.7, 0);
    charGroup.add(head);

    // Visor / Eyes
    if (avatar.visor !== 'none') {
      const visorGeo = new THREE.BoxGeometry(0.36, 0.14, 0.1);
      const visorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(avatar.glowColor) });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 1.72, 0.2);
      charGroup.add(visorMesh);
    }

    // 3. Hair / Crest
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatar.hairColor),
      metalness: 0.5,
      roughness: 0.3,
    });

    if (avatar.hairStyle === 'cyber_hawk') {
      const hawkGeo = new THREE.BoxGeometry(0.1, 0.35, 0.45);
      const hawk = new THREE.Mesh(hawkGeo, hairMat);
      hawk.position.set(0, 2.05, 0);
      charGroup.add(hawk);
    } else if (avatar.hairStyle === 'spikes') {
      for (let s = -0.15; s <= 0.15; s += 0.1) {
        const spikeGeo = new THREE.ConeGeometry(0.08, 0.3, 4);
        const spike = new THREE.Mesh(spikeGeo, hairMat);
        spike.position.set(s, 2.0, 0);
        charGroup.add(spike);
      }
    } else if (avatar.hairStyle === 'cyber_helm') {
      const helmGeo = new THREE.SphereGeometry(0.26, 12, 12);
      const helm = new THREE.Mesh(helmGeo, chassisMat);
      helm.position.set(0, 1.85, 0);
      charGroup.add(helm);
    }

    // 4. Shoulders & Cyber Arms
    const shoulderGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const shoulderL = new THREE.Mesh(shoulderGeo, chassisMat);
    shoulderL.position.set(-0.46, 1.35, 0);
    charGroup.add(shoulderL);

    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
    const armL = new THREE.Mesh(armGeo, chassisMat);
    armL.position.set(-0.46, 0.95, 0);
    charGroup.add(armL);

    const shoulderR = new THREE.Mesh(shoulderGeo, chassisMat);
    shoulderR.position.set(0.46, 1.35, 0);
    charGroup.add(shoulderR);

    const armR = new THREE.Mesh(armGeo, chassisMat);
    armR.position.set(0.46, 0.95, 0);
    charGroup.add(armR);

    // 5. Pelvis & Cyber Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.85, 8);
    const legL = new THREE.Mesh(legGeo, chassisMat);
    legL.position.set(-0.18, 0.35, 0);
    charGroup.add(legL);

    const legR = new THREE.Mesh(legGeo, chassisMat);
    legR.position.set(0.18, 0.35, 0);
    charGroup.add(legR);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.18, 0.15, 0.28);
    const bootL = new THREE.Mesh(bootGeo, chassisMat);
    bootL.position.set(-0.18, -0.05, 0.05);
    charGroup.add(bootL);

    const bootR = new THREE.Mesh(bootGeo, chassisMat);
    bootR.position.set(0.18, -0.05, 0.05);
    charGroup.add(bootR);

    // 6. Cybernetic Hologram Wings
    if (avatar.wings) {
      const wingGeo = new THREE.PlaneGeometry(1.6, 0.8);
      const wingMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(avatar.glowColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 1.3, -0.25);
      charGroup.add(wings);
      wingsMeshRef.current = wings;
    }

    // 7. Floating Drone Companion
    if (avatar.drone) {
      const droneGroup = new THREE.Group();
      droneGroup.position.set(0.9, 1.6, 0.3);

      const droneBodyGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const droneBodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      const droneBody = new THREE.Mesh(droneBodyGeo, droneBodyMat);
      droneGroup.add(droneBody);

      // Drone glowing scanner eye
      const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(avatar.glowColor) });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0, 0.12);
      droneGroup.add(eye);

      // Drone orbital ring
      const dRingGeo = new THREE.TorusGeometry(0.24, 0.02, 8, 24);
      const dRing = new THREE.Mesh(dRingGeo, eyeMat);
      droneGroup.add(dRing);

      scene.add(droneGroup);
      droneGroupRef.current = droneGroup;
    }

    // Interactive Drag to Rotate Avatar
    let isDragging = false;
    let previousMouseX = 0;

    const handlePointerDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!isDragging || !avatarGroupRef.current) return;
      const deltaX = e.clientX - previousMouseX;
      avatarGroupRef.current.rotation.y += deltaX * 0.012;
      previousMouseX = e.clientX;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Gentle auto-rotation when not dragging
      if (!isDragging && avatarGroupRef.current) {
        avatarGroupRef.current.rotation.y += 0.3 * delta;
      }

      // Drone hovering motion
      if (droneGroupRef.current) {
        droneGroupRef.current.position.y = 1.6 + Math.sin(time * 3) * 0.1;
        droneGroupRef.current.rotation.y += 1.5 * delta;
      }

      // Subtle breathing motion for torso
      if (avatarGroupRef.current) {
        avatarGroupRef.current.position.y = -0.9 + Math.sin(time * 2) * 0.02;
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
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [avatar]);

  // Handle Save
  const handleSave = () => {
    sound.playWin(3);
    onSaveAvatar(avatar);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-stretch">
      {/* 3D Preview Canvas Viewport */}
      <div className="flex-1 relative min-h-[440px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col justify-between">
        <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* Top Badges */}
        <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/30">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="font-cyber text-xs tracking-wider text-cyan-300 uppercase">
              3D AVATAR STUDIO
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30 font-tech text-xs text-purple-300">
            VIP STATUS: <span className="font-bold text-yellow-400">{profile.vipTier}</span>
          </div>
        </div>

        {/* Drag Hint Footer */}
        <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
          <span className="bg-slate-900/80 px-3 py-1 rounded-md text-[11px] font-tech text-slate-400 border border-slate-700">
            ↔ DRAG 360° TO ROTATE AVATAR
          </span>
          {savedSuccess && (
            <span className="bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-cyber text-xs px-3 py-1 rounded-md flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> AVATAR EQUIPPED!
            </span>
          )}
        </div>
      </div>

      {/* Customization Controls Sidebar */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-cyber text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              CYBORG LAB
            </h3>
            <span className="text-xs font-tech text-slate-400">LVL {profile.vipTier} ACCESS</span>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
            {[
              { id: 'chassis', label: 'SKIN' },
              { id: 'hair', label: 'HAIR' },
              { id: 'visor', label: 'OPTICS' },
              { id: 'accessories', label: 'GEAR' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playUiClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`py-1.5 text-xs font-tech font-bold rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Options */}
          <div className="space-y-4">
            {activeTab === 'chassis' && (
              <div>
                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mb-2">
                  CHASSIS FINISH:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'carbon', label: 'Carbon Fiber', color: '#1e293b' },
                    { id: 'titanium', label: 'Chrome Titanium', color: '#d1d5db' },
                    { id: 'obsidian', label: 'Obsidian Gold', color: '#111827' },
                    { id: 'synth_blue', label: 'Hyper Cyan', color: '#0284c7' },
                    { id: 'rose_gold', label: 'Rose Gold', color: '#f43f5e' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playUiClick();
                        setAvatar({ ...avatar, chassis: item.id as AvatarCustomization['chassis'] });
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        avatar.chassis === item.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                      <span className="font-tech text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>

                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mt-4 mb-2">
                  NEON ENERGY GLOW:
                </label>
                <div className="flex gap-2.5">
                  {['#00f0ff', '#bd00ff', '#ffd700', '#00ff88', '#ff0055'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        sound.playUiClick();
                        setAvatar({ ...avatar, glowColor: hex });
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        avatar.glowColor === hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: hex, boxShadow: `0 0 12px ${hex}` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hair' && (
              <div>
                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mb-2">
                  HAIRSTYLE / CRANIAL CREST:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cyber_hawk', label: 'Cyber Mohawk' },
                    { id: 'spikes', label: 'Plasma Spikes' },
                    { id: 'cyber_helm', label: 'Sentinel Helm' },
                    { id: 'neon_bob', label: 'Sleek Nano' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        sound.playUiClick();
                        setAvatar({ ...avatar, hairStyle: style.id as AvatarCustomization['hairStyle'] });
                      }}
                      className={`p-2.5 rounded-xl border text-left font-tech text-xs font-bold transition ${
                        avatar.hairStyle === style.id
                          ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mt-4 mb-2">
                  HAIR / ACCENT TINT:
                </label>
                <div className="flex gap-2.5">
                  {['#00f0ff', '#ff00aa', '#ffd700', '#10b981', '#ffffff'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        sound.playUiClick();
                        setAvatar({ ...avatar, hairColor: hex });
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        avatar.hairColor === hex ? 'border-white scale-110' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'visor' && (
              <div>
                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mb-2">
                  OPTICAL SENSORS & VISOR:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hologram', label: 'Hologram Visor' },
                    { id: 'tactical', label: 'Combat Scanner' },
                    { id: 'full_mask', label: 'Cyber Mask' },
                    { id: 'none', label: 'Exposed Optics' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playUiClick();
                        setAvatar({ ...avatar, visor: item.id as AvatarCustomization['visor'] });
                      }}
                      className={`p-2.5 rounded-xl border text-left font-tech text-xs font-bold transition ${
                        avatar.visor === item.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accessories' && (
              <div className="space-y-3">
                <label className="text-xs font-tech text-slate-300 uppercase tracking-wider block mb-2">
                  VIP EXCLUSIVES & COMPANIONS:
                </label>

                <div
                  onClick={() => {
                    sound.playUiClick();
                    setAvatar({ ...avatar, wings: !avatar.wings });
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    avatar.wings
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-tech text-sm font-bold">Holographic Plasma Wings</span>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${avatar.wings ? 'bg-cyan-500 border-cyan-400' : 'border-slate-700'}`}>
                    {avatar.wings && <Check className="w-3.5 h-3.5 text-slate-950" />}
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playUiClick();
                    setAvatar({ ...avatar, drone: !avatar.drone });
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    avatar.drone
                      ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="font-tech text-sm font-bold">Orbital Sentinel Drone</span>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${avatar.drone ? 'bg-purple-500 border-purple-400' : 'border-slate-700'}`}>
                    {avatar.drone && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save & Equip CTA */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-cyber font-bold text-sm bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            EQUIP TO PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};
