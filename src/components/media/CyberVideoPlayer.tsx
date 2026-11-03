import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/sound';
import { Film, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, ChevronRight, Tv } from 'lucide-react';

interface TrailerItem {
  id: string;
  title: string;
  tagline: string;
  duration: number; // in seconds
  themeColor: string;
  category: string;
  narrative: string[];
}

export const CyberVideoPlayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedTrailer, setSelectedTrailer] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const trailers: TrailerItem[] = [
    {
      id: 'cinematic_2088',
      title: 'Future Fusion 2088: Official Cinematic Trailer',
      tagline: 'Experience the genesis of the next-generation 3D gaming metaverse',
      duration: 30,
      themeColor: '#00f0ff',
      category: 'GLOBAL CINEMATIC',
      narrative: [
        'INITIATING NEON QUANTUM LINK...',
        'CONNECTING 14,000 CONCURRENT RACERS...',
        'THE MECHA-DRAGON AWAKENS IN THE INFERNO...',
        'JACKPOT MATRIX REACHES 2,500,000 COINS...',
        'ENTER THE FUTURE OF 3D GAMING.',
      ],
    },
    {
      id: 'deep_sea_trailer',
      title: 'Deep Sea Harpoon Tournament: Megalodon Rising',
      tagline: 'Descend 5,000 meters into the bioluminescent abyssal trenches',
      duration: 25,
      themeColor: '#00ff88',
      category: '3D SIMULATION',
      narrative: [
        'SUBMERGING TO OCEAN FLOOR TRENCH...',
        'BIOLUMINESCENT HARPOONS CHARGED...',
        'TARGET ACQUIRED: QUANTUM JELLY & BOSS MEGALODON...',
        'UNLEASH CRYO FROST AND THUNDER WEBS...',
        'DOMINATE THE GLOBAL FISHING LEADERBOARD.',
      ],
    },
    {
      id: 'dragon_slot_trailer',
      title: 'Cyber Dragon Inferno: Mecha Core Respuns',
      tagline: 'High-volatility draconic fury and 10,000x flame multipliers',
      duration: 20,
      themeColor: '#ff0055',
      category: '3D SLOTS',
      narrative: [
        'FORGING HIGH-ROLLER 3D CYLINDER REELS...',
        'ALIGNING PLASMA CORES & ANCIENT HIEROGLYPHS...',
        'MEGA QUANTUM WIN ACTIVATED: 10,000X...',
        'RULE THE HIGH-ROLLER ROYALE MATRIX.',
      ],
    },
    {
      id: 'space_racer_trailer',
      title: 'Space Odyssey & Warp Tunnel Flight',
      tagline: 'Hyperspace speeds through cosmic pulsar rings',
      duration: 22,
      themeColor: '#bd00ff',
      category: 'ARCADE RACER',
      narrative: [
        'STARSHIP ENGINES PRIMED AT 99%...',
        'WARP TUNNEL GATES ALIGNING...',
        'DODGING QUANTUM BARRIERS AT LIGHTSPEED...',
        'CASH OUT BEFORE THE HYPERDRIVE CRASH.',
      ],
    },
  ];

  const activeTrailer = trailers[selectedTrailer];

  // Trailer Playback Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeTrailer.duration) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrailer.duration]);

  // Procedural Cinematic Canvas Rendering (Animated Hologram Particle Vortex & Audio Waveforms)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const t = performance.now() * 0.001;

      // Dark sci-fi background
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, width, height);

      // Radial glowing center singularity
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.6);
      grad.addColorStop(0, `${activeTrailer.themeColor}33`);
      grad.addColorStop(0.6, 'rgba(10, 15, 35, 0.4)');
      grad.addColorStop(1, '#050714');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Rotating Hologram Energy Rings
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        const radius = 60 + r * 50 + Math.sin(t * 2 + r) * 15;
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = activeTrailer.themeColor;
        ctx.lineWidth = r === 1 ? 3 : 1;
        ctx.setLineDash([15, 20 + r * 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Procedural Audio Equalizer Spectrum Bars at Bottom
      const barCount = 48;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const barHeight = isPlaying
          ? (Math.sin(t * 5 + i * 0.4) * 0.5 + 0.5) * 80 + Math.random() * 20
          : 15;
        const bx = i * barWidth;
        const by = height - barHeight - 20;

        ctx.fillStyle = activeTrailer.themeColor;
        ctx.shadowColor = activeTrailer.themeColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(bx + 2, by, barWidth - 4, barHeight);
      }

      // Draw Cinematic Narrative Subtitle Lines based on current time
      const narrativeIndex = Math.floor((currentTime / activeTrailer.duration) * activeTrailer.narrative.length);
      const currentSubtitle = activeTrailer.narrative[Math.min(narrativeIndex, activeTrailer.narrative.length - 1)];

      if (currentSubtitle) {
        ctx.font = 'bold 22px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = activeTrailer.themeColor;
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.fillText(currentSubtitle, width / 2, height * 0.42);
      }

      // Center Holo Badge
      ctx.font = 'bold 12px Rajdhani, sans-serif';
      ctx.fillStyle = activeTrailer.themeColor;
      ctx.shadowBlur = 0;
      ctx.fillText(`FUTURE FUSION 3D HOLO-THEATER // 4K 60FPS SIMULATION`, width / 2, 40);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, activeTrailer]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cyber text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-cyan-400" />
            3D FUTURE VIDEO & HOLO-CINEMA
          </h2>
          <p className="font-tech text-xs text-slate-400">
            Cinematic 3D trailers, immersive soundscapes, and gameplay previews
          </p>
        </div>
        <span className="font-cyber text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
          PROD. 2088
        </span>
      </div>

      {/* Main Video Viewport Player */}
      <div className="relative w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        <canvas ref={canvasRef} width={960} height={440} className="w-full h-full" />

        {/* Top Video Metadata */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-cyber text-xs font-bold text-white uppercase">
              {activeTrailer.category}
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-purple-500/30 font-cyber text-xs text-purple-300">
            {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')} / 0:{String(activeTrailer.duration).padStart(2, '0')}
          </div>
        </div>

        {/* Video Bottom Scrub Bar & Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentTime / activeTrailer.duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setIsPlaying(!isPlaying);
                }}
                className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  const m = sound.toggleMute();
                  setIsMuted(m);
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition cursor-pointer border border-slate-700"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <div>
                <h4 className="font-cyber text-xs font-bold text-white">{activeTrailer.title}</h4>
                <p className="font-tech text-[11px] text-slate-400">{activeTrailer.tagline}</p>
              </div>
            </div>

            <span className="font-tech text-xs text-cyan-400 font-bold hidden sm:inline">
              PROVABLY CINEMATIC 60FPS
            </span>
          </div>
        </div>
      </div>

      {/* Trailer Selection Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {trailers.map((t, idx) => (
          <div
            key={t.id}
            onClick={() => {
              sound.playUiClick();
              setSelectedTrailer(idx);
              setCurrentTime(0);
              setIsPlaying(true);
            }}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedTrailer === idx
                ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-cyber text-slate-400 mb-1">
                <span>0:{String(t.duration).padStart(2, '0')}</span>
                <span style={{ color: t.themeColor }}>{t.category}</span>
              </div>
              <h5 className="font-cyber text-xs font-bold text-white line-clamp-1">{t.title}</h5>
              <p className="font-tech text-[11px] text-slate-400 mt-1 line-clamp-2">{t.tagline}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-tech text-cyan-400">
              <span>{selectedTrailer === idx ? '▶ PLAYING NOW' : 'WATCH TRAILER'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
