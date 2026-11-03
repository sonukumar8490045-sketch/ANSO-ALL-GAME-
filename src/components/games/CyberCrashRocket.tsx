import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { Rocket, Zap, Play, Check, Flame, Trophy, AlertTriangle, Users } from 'lucide-react';

interface CyberCrashRocketProps {
  userCoins: number;
  onCoinsChange: (coins: number) => void;
  onRecordWin: (amount: number, bet: number) => void;
}

export const CyberCrashRocket: React.FC<CyberCrashRocketProps> = ({
  userCoins,
  onCoinsChange,
  onRecordWin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Betting & Game States
  const [bet, setBet] = useState<number>(50);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.0);
  const [recentCrashes, setRecentCrashes] = useState<number[]>([2.14, 1.45, 5.82, 1.12, 12.4, 3.25]);
  const [simulatedPlayers, setSimulatedPlayers] = useState<{ name: string; bet: number; cashedAt?: number }[]>([
    { name: 'Krypton_99', bet: 100 },
    { name: 'CyberQueen', bet: 250 },
    { name: 'VoidWalker', bet: 50 },
    { name: 'MatrixOverlord', bet: 500 },
  ]);

  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Launch Rocket Action
  const handleLaunch = () => {
    if (gameState === 'flying') return;
    if (userCoins < bet) {
      sound.playUiClick();
      return;
    }

    onCoinsChange(userCoins - bet);
    sound.playSpinStart();

    // Determine random crash point based on house edge
    // ~10% instant crash < 1.20, majority 1.5 - 4.0, rare 10x - 50x
    const rand = Math.random();
    let targetCrash = 1.0;
    if (rand < 0.08) {
      targetCrash = 1.05 + Math.random() * 0.15;
    } else if (rand < 0.7) {
      targetCrash = 1.25 + Math.random() * 2.5;
    } else if (rand < 0.92) {
      targetCrash = 3.8 + Math.random() * 5.0;
    } else {
      targetCrash = 9.0 + Math.random() * 30.0;
    }

    setCrashPoint(targetCrash);
    setMultiplier(1.0);
    setGameState('flying');
    startTimeRef.current = performance.now();

    // Reset simulated players
    setSimulatedPlayers([
      { name: 'Krypton_99', bet: 100 },
      { name: 'CyberQueen', bet: 250 },
      { name: 'VoidWalker', bet: 50 },
      { name: 'MatrixOverlord', bet: 500 },
    ]);
  };

  // Cash Out Action
  const handleCashOut = () => {
    if (gameState !== 'flying') return;
    const finalMult = multiplier;
    const payout = Math.round(bet * finalMult);
    sound.playWin(finalMult);
    setGameState('cashed_out');
    onCoinsChange(userCoins + payout);
    onRecordWin(payout, bet);

    if (finalMult >= 3) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Canvas Drawing & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas & draw futuristic dark space grid
      ctx.fillStyle = '#060815';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (gameState === 'flying' || gameState === 'cashed_out') {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        // Exponential growth curve
        const currentM = 1.0 + Math.pow(elapsed * 0.8, 1.85);
        setMultiplier(Number(currentM.toFixed(2)));

        // Simulated players auto cash-out logic
        setSimulatedPlayers((prev) =>
          prev.map((p) => {
            if (!p.cashedAt && currentM > 1.4 && Math.random() < 0.015) {
              return { ...p, cashedAt: Number(currentM.toFixed(2)) };
            }
            return p;
          })
        );

        // Check if rocket reached crash point
        if (currentM >= crashPoint) {
          sound.playUiClick();
          setGameState('crashed');
          setRecentCrashes((prev) => [Number(crashPoint.toFixed(2)), ...prev].slice(0, 7));
          return;
        }

        // Rocket flight coordinates along quadratic curve
        const progress = Math.min(1.0, elapsed / 8);
        const rx = 40 + progress * (width - 100);
        const ry = height - 50 - Math.pow(progress, 0.8) * (height - 120);

        // Draw glowing laser trajectory arc
        ctx.beginPath();
        ctx.moveTo(40, height - 50);
        ctx.quadraticCurveTo(width * 0.35, height - 60, rx, ry);
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Area under trajectory curve fill
        ctx.lineTo(rx, height - 50);
        ctx.lineTo(40, height - 50);
        const grad = ctx.createLinearGradient(0, ry, 0, height - 50);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw Plasma Exhaust Thruster flame particles
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const px = rx - 15 - Math.random() * 20;
          const py = ry + 8 + (Math.random() - 0.5) * 10;
          ctx.arc(px, py, 4 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#ff0055' : '#ffaa00';
          ctx.shadowColor = '#ff5500';
          ctx.shadowBlur = 10;
          ctx.fill();
        }

        // Draw Cyber Rocket (Fuselage & Wings)
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(-0.45);

        // Rocket body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rocket nosecone
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(14, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Rocket wings
        ctx.fillStyle = '#bd00ff';
        ctx.fillRect(-12, -10, 8, 4);
        ctx.fillRect(-12, 6, 8, 4);

        ctx.restore();
      } else if (gameState === 'crashed') {
        // Draw Explosion Blast
        ctx.font = 'bold 32px Orbitron, sans-serif';
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.fillText(`HYPERDRIVE CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2);
      } else {
        // Idle State Screen
        ctx.font = 'bold 20px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('AWAITING NEXT QUANTUM LAUNCH', width / 2, height / 2);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, crashPoint]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center space-y-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <h3 className="font-cyber text-lg font-bold text-white text-glow-cyan">
            CYBER CRASH 2088
          </h3>
          <span className="text-[10px] font-cyber px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            HIGH VOLATILITY
          </span>
        </div>

        {/* Recent Crash Multiplier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="font-tech text-xs text-slate-400 uppercase mr-1">HISTORY:</span>
          {recentCrashes.map((val, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded text-xs font-cyber font-bold ${
                val >= 2 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {val}x
            </span>
          ))}
        </div>
      </div>

      {/* Main Multiplier & Rocket Canvas Display */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner">
        <canvas ref={canvasRef} width={800} height={320} className="w-full h-full" />

        {/* Center Live Multiplier Readout */}
        {gameState !== 'idle' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div
              className={`font-cyber text-5xl md:text-6xl font-black tabular-nums ${
                gameState === 'crashed'
                  ? 'text-rose-500'
                  : gameState === 'cashed_out'
                  ? 'text-emerald-400 text-glow-cyan'
                  : 'text-yellow-400 text-glow-gold'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>
            {gameState === 'cashed_out' && (
              <span className="font-cyber text-sm font-bold text-emerald-300 mt-1 block">
                CASHED OUT: +{Math.round(bet * multiplier).toLocaleString()} COINS
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls & Active Simulated Bets Bar */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Bet Selector */}
        <div className="flex items-center gap-2">
          <span className="font-tech text-xs text-slate-400 uppercase font-semibold">BET:</span>
          <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
            {[25, 50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setBet(amt)}
                disabled={gameState === 'flying'}
                className={`px-3 py-1 text-xs font-tech font-bold rounded-lg ${
                  bet === amt ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Launch / Cash Out CTA */}
        <div>
          {gameState === 'flying' ? (
            <button
              onClick={handleCashOut}
              className="w-full py-3 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition cursor-pointer"
            >
              CASH OUT ({Math.round(bet * multiplier).toLocaleString()} COINS)
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              className="w-full py-3 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              LAUNCH ROCKET ({bet} COINS)
            </button>
          )}
        </div>

        {/* Simulated Co-Players Status */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-tech">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              LIVE RACERS
            </span>
            <span className="text-cyan-400 font-cyber font-bold">4 ONLINE</span>
          </div>
          <div className="space-y-1">
            {simulatedPlayers.slice(0, 2).map((p, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-slate-300">{p.name}</span>
                <span className={p.cashedAt ? 'text-emerald-400 font-bold' : 'text-yellow-400'}>
                  {p.cashedAt ? `Cashed @ ${p.cashedAt}x` : `${p.bet} Coins In`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
