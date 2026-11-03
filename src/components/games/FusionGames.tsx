import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Zap, Shield, Trophy, Flame, RefreshCw, AlertTriangle } from 'lucide-react';

interface FusionGamesProps {
  userCoins: number;
  onCoinsChange: (coins: number) => void;
  onRecordWin: (amount: number, bet: number) => void;
}

export const FusionGames: React.FC<FusionGamesProps> = ({
  userCoins,
  onCoinsChange,
  onRecordWin,
}) => {
  const [selectedGame, setSelectedGame] = useState<'roulette' | 'plinko' | 'dragon_battle' | 'matrix'>('roulette');

  // ==========================================
  // GAME 1: CYBER ROULETTE 2088
  // ==========================================
  const [rouletteBetType, setRouletteBetType] = useState<'red' | 'black' | 'green_zero' | 'quantum'>('red');
  const [rouletteBetAmount, setRouletteBetAmount] = useState<number>(50);
  const [rouletteSpinning, setRouletteSpinning] = useState<boolean>(false);
  const [rouletteResult, setRouletteResult] = useState<{ number: number; color: 'red' | 'black' | 'green'; multiplier: number } | null>(null);
  const [rouletteAngle, setRouletteAngle] = useState<number>(0);

  const spinRoulette = () => {
    if (rouletteSpinning) return;
    if (userCoins < rouletteBetAmount) {
      sound.playUiClick();
      return;
    }

    onCoinsChange(userCoins - rouletteBetAmount);
    setRouletteSpinning(true);
    setRouletteResult(null);
    sound.playSpinStart();

    const extraSpins = 5 * 360 + Math.floor(Math.random() * 360);
    setRouletteAngle((prev) => prev + extraSpins);

    setTimeout(() => {
      sound.playReelStop(1);
      const landedNumber = Math.floor(Math.random() * 37); // 0 to 36
      const color: 'red' | 'black' | 'green' = landedNumber === 0 ? 'green' : landedNumber % 2 === 0 ? 'red' : 'black';

      // Check Quantum Lightning 50x-500x chance
      const hasLightning = Math.random() < 0.2;
      const quantumMult = hasLightning ? (Math.random() < 0.5 ? 50 : 100) : 1;

      let won = false;
      let payout = 0;

      if (rouletteBetType === 'red' && color === 'red') {
        won = true;
        payout = rouletteBetAmount * 2 * quantumMult;
      } else if (rouletteBetType === 'black' && color === 'black') {
        won = true;
        payout = rouletteBetAmount * 2 * quantumMult;
      } else if (rouletteBetType === 'green_zero' && color === 'green') {
        won = true;
        payout = rouletteBetAmount * 35 * quantumMult;
      } else if (rouletteBetType === 'quantum' && hasLightning) {
        won = true;
        payout = rouletteBetAmount * quantumMult;
      }

      setRouletteResult({ number: landedNumber, color, multiplier: won ? quantumMult : 0 });
      setRouletteSpinning(false);

      if (won) {
        sound.playWin(payout / rouletteBetAmount);
        onCoinsChange(userCoins - rouletteBetAmount + payout);
        onRecordWin(payout, rouletteBetAmount);
        if (payout >= 1000) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }
    }, 2400);
  };

  // ==========================================
  // GAME 2: NEON PLINKO CASCADE
  // ==========================================
  const plinkoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [plinkoBet, setPlinkoBet] = useState<number>(50);
  const [plinkoDropping, setPlinkoDropping] = useState<boolean>(false);
  const [plinkoHistory, setPlinkoHistory] = useState<number[]>([]);

  const dropPlinkoBall = () => {
    if (userCoins < plinkoBet) return;
    onCoinsChange(userCoins - plinkoBet);
    setPlinkoDropping(true);
    sound.playSpinStart();

    const canvas = plinkoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const width = canvas.width;
    const height = canvas.height;
    const rows = 8;
    const bins = [10, 4, 1.5, 0.5, 0.2, 0.5, 1.5, 4, 10];

    let ballX = width / 2 + (Math.random() - 0.5) * 8;
    let ballY = 20;
    let ballVx = 0;
    let ballVy = 2.5;

    const anim = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw glowing pins
      for (let r = 0; r < rows; r++) {
        const pinCount = r + 3;
        const spacing = width / (pinCount + 1);
        const y = 50 + r * 35;

        for (let c = 0; c < pinCount; c++) {
          const px = (c + 1) * spacing;
          ctx.beginPath();
          ctx.arc(px, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Ball collision with pin
          const dist = Math.hypot(ballX - px, ballY - y);
          if (dist < 12) {
            ballVy *= 0.7;
            ballVx += (ballX > px ? 1.8 : -1.8) + (Math.random() - 0.5) * 0.8;
            sound.playCoinDing();
          }
        }
      }

      // Draw bottom multiplier buckets
      const binWidth = width / bins.length;
      bins.forEach((b, idx) => {
        const bx = idx * binWidth;
        ctx.fillStyle = b >= 4 ? 'rgba(255, 42, 95, 0.3)' : b >= 1.5 ? 'rgba(189, 0, 255, 0.25)' : 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(bx + 2, height - 32, binWidth - 4, 30);
        ctx.strokeStyle = b >= 4 ? '#ff2a5f' : '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 2, height - 32, binWidth - 4, 30);

        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.fillStyle = b >= 4 ? '#ffd700' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${b}x`, bx + binWidth / 2, height - 12);
      });

      // Update ball physics
      ballVy += 0.2; // gravity
      ballX += ballVx;
      ballY += ballVy;
      ballVx *= 0.98;

      // Draw neon cyber orb
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.fill();

      if (ballY < height - 32) {
        requestAnimationFrame(anim);
      } else {
        // Ball landed in bin
        const binIndex = Math.max(0, Math.min(bins.length - 1, Math.floor(ballX / binWidth)));
        const mult = bins[binIndex];
        const winAmount = Math.round(plinkoBet * mult);
        setPlinkoHistory((prev) => [mult, ...prev].slice(0, 6));
        setPlinkoDropping(false);

        sound.playWin(mult);
        onCoinsChange(userCoins - plinkoBet + winAmount);
        onRecordWin(winAmount, plinkoBet);

        if (mult >= 4) {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
        }
      }
    };

    anim();
  };

  // ==========================================
  // GAME 3: CYBER DRAGON BATTLE ARENA
  // ==========================================
  const [dragonHp, setDragonHp] = useState<number>(100);
  const [playerShield, setPlayerShield] = useState<number>(100);
  const [battleBet, setBattleBet] = useState<number>(100);
  const [battleInProgress, setBattleInProgress] = useState<boolean>(false);
  const [battleStatus, setBattleStatus] = useState<string>('Challenge the Mecha-Dragon! Choose your tactical stance.');

  const startDragonDuel = (action: 'heavy_plasma' | 'counter_shield' | 'overload') => {
    if (userCoins < battleBet && !battleInProgress) return;
    if (!battleInProgress) {
      onCoinsChange(userCoins - battleBet);
      setBattleInProgress(true);
      setDragonHp(100);
      setPlayerShield(100);
    }

    sound.playLaserShot();

    // Player action
    let playerDamage = 0;
    if (action === 'heavy_plasma') playerDamage = 25 + Math.floor(Math.random() * 20);
    if (action === 'counter_shield') playerDamage = 15 + Math.floor(Math.random() * 15);
    if (action === 'overload') playerDamage = Math.random() > 0.4 ? 45 : 5;

    // Dragon action
    const dragonDamage = action === 'counter_shield' ? 5 : 15 + Math.floor(Math.random() * 20);

    const nextDragonHp = Math.max(0, dragonHp - playerDamage);
    const nextPlayerShield = Math.max(0, playerShield - dragonDamage);

    setDragonHp(nextDragonHp);
    setPlayerShield(nextPlayerShield);

    if (nextDragonHp <= 0) {
      // VICTORY!
      const reward = battleBet * 4;
      sound.playJackpot();
      setBattleStatus(`🏆 DRAGON DEFEATED! You earned ${reward.toLocaleString()} COINS! (4X MULTIPLIER)`);
      setBattleInProgress(false);
      onCoinsChange(userCoins + reward);
      onRecordWin(reward, battleBet);
      confetti({ particleCount: 100, spread: 70 });
    } else if (nextPlayerShield <= 0) {
      // DEFEAT
      sound.playUiClick();
      setBattleStatus('SHIELDS BREACHED! Mecha-Dragon repelled your attack.');
      setBattleInProgress(false);
    } else {
      setBattleStatus(`Hit Mecha-Dragon for -${playerDamage} HP! Dragon retaliated for -${dragonDamage} damage.`);
    }
  };

  // ==========================================
  // GAME 4: TREASURE MATRIX (5x5 MINESWEEPER CASHOUT)
  // ==========================================
  const [matrixGrid, setMatrixGrid] = useState<{ id: number; revealed: boolean; isTrap: boolean }[]>([]);
  const [matrixBet, setMatrixBet] = useState<number>(50);
  const [matrixActive, setMatrixActive] = useState<boolean>(false);
  const [matrixCurrentMult, setMatrixCurrentMult] = useState<number>(1.0);
  const [matrixRevealedCount, setMatrixRevealedCount] = useState<number>(0);
  const [matrixGameOver, setMatrixGameOver] = useState<boolean>(false);

  const startMatrixGame = () => {
    if (userCoins < matrixBet) return;
    onCoinsChange(userCoins - matrixBet);
    sound.playSpinStart();

    // Generate 5x5 grid with 3 traps
    const cells = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      revealed: false,
      isTrap: false,
    }));

    // Plant 3 random traps
    let trapsPlaced = 0;
    while (trapsPlaced < 3) {
      const idx = Math.floor(Math.random() * 25);
      if (!cells[idx].isTrap) {
        cells[idx].isTrap = true;
        trapsPlaced++;
      }
    }

    setMatrixGrid(cells);
    setMatrixActive(true);
    setMatrixCurrentMult(1.0);
    setMatrixRevealedCount(0);
    setMatrixGameOver(false);
  };

  const clickMatrixCell = (idx: number) => {
    if (!matrixActive || matrixGameOver || matrixGrid[idx].revealed) return;

    const cell = matrixGrid[idx];
    const newGrid = [...matrixGrid];
    newGrid[idx].revealed = true;
    setMatrixGrid(newGrid);

    if (cell.isTrap) {
      // Hit trap!
      sound.playReelStop(0);
      setMatrixGameOver(true);
      setMatrixActive(false);
      // reveal all traps
      setMatrixGrid((prev) => prev.map((c) => ({ ...c, revealed: c.revealed || c.isTrap })));
    } else {
      // Safe cell!
      sound.playCoinDing();
      const count = matrixRevealedCount + 1;
      setMatrixRevealedCount(count);
      const newMult = Number((1 + count * 0.35).toFixed(2));
      setMatrixCurrentMult(newMult);
    }
  };

  const cashOutMatrix = () => {
    if (!matrixActive || matrixGameOver || matrixRevealedCount === 0) return;
    const payout = Math.round(matrixBet * matrixCurrentMult);
    sound.playWin(matrixCurrentMult);
    onCoinsChange(userCoins + payout);
    onRecordWin(payout, matrixBet);
    setMatrixActive(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Game Selector Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-cyan-500/30">
        {[
          { id: 'roulette', label: 'CYBER ROULETTE 2088', icon: '⚡' },
          { id: 'plinko', label: 'NEON PLINKO CASCADE', icon: '🔮' },
          { id: 'dragon_battle', label: 'DRAGON ARENA DUEL', icon: '🐲' },
          { id: 'matrix', label: 'TREASURE VAULT MATRIX', icon: '💎' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => {
              sound.playUiClick();
              setSelectedGame(game.id as typeof selectedGame);
            }}
            className={`px-4 py-2.5 rounded-xl font-cyber text-xs md:text-sm font-bold flex items-center gap-2 transition ${
              selectedGame === game.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{game.icon}</span>
            <span>{game.label}</span>
          </button>
        ))}
      </div>

      {/* GAME 1: CYBER ROULETTE */}
      {selectedGame === 'roulette' && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          <div className="text-center mb-6">
            <h3 className="font-cyber text-xl font-bold text-white text-glow-cyan flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              CYBER ROULETTE 2088
            </h3>
            <p className="font-tech text-xs text-slate-400 mt-1">
              Quantum Lightning multipliers strike random rounds with up to 100x rewards!
            </p>
          </div>

          {/* Animated Futuristic Roulette Wheel SVG */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center my-4">
            <div
              className="w-full h-full rounded-full border-4 border-cyan-400/50 shadow-[0_0_40px_rgba(0,240,255,0.3)] transition-transform duration-[2400ms] ease-out flex items-center justify-center"
              style={{
                transform: `rotate(${rouletteAngle}deg)`,
                background: 'conic-gradient(#ff0055 0deg 18deg, #090d1f 18deg 36deg, #ff0055 36deg 54deg, #090d1f 54deg 72deg, #00ff88 72deg 82deg, #ff0055 82deg 100deg, #090d1f 100deg 118deg, #ff0055 118deg 136deg, #090d1f 136deg 154deg, #ff0055 154deg 172deg, #090d1f 172deg 190deg, #ff0055 190deg 208deg, #090d1f 208deg 226deg, #ff0055 226deg 244deg, #090d1f 244deg 262deg, #ff0055 262deg 280deg, #090d1f 280deg 298deg, #ff0055 298deg 316deg, #090d1f 316deg 334deg, #ff0055 334deg 352deg, #090d1f 352deg 360deg)',
              }}
            >
              <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)] flex flex-col items-center justify-center">
                <span className="font-cyber text-xs text-yellow-400 font-bold">QUANTUM</span>
                <span className="font-tech text-[10px] text-cyan-300">CORE</span>
              </div>
            </div>

            {/* Top Fixed Ball Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-6 bg-yellow-400 clip-triangle shadow-[0_0_15px_#ffd700] z-10" />
          </div>

          {/* Outcome Readout */}
          {rouletteResult && (
            <div className="bg-slate-950 px-6 py-2.5 rounded-xl border border-cyan-400/50 my-2 text-center shadow-lg">
              <span className="font-cyber text-lg font-bold text-white">
                RESULT: #{rouletteResult.number} ({rouletteResult.color.toUpperCase()})
              </span>
              {rouletteResult.multiplier > 0 && (
                <div className="font-cyber text-sm font-black text-yellow-400">
                  ⚡ WINNER! MULTIPLIER: {rouletteResult.multiplier}X
                </div>
              )}
            </div>
          )}

          {/* Bet Options */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {[
              { id: 'red', label: 'RED (2X)', color: 'bg-rose-600 border-rose-400' },
              { id: 'black', label: 'BLACK (2X)', color: 'bg-slate-800 border-slate-600' },
              { id: 'green_zero', label: 'GREEN 0 (35X)', color: 'bg-emerald-600 border-emerald-400' },
              { id: 'quantum', label: 'QUANTUM LIGHTNING (100X)', color: 'bg-purple-600 border-purple-400' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  sound.playUiClick();
                  setRouletteBetType(opt.id as typeof rouletteBetType);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-tech font-bold border transition ${
                  rouletteBetType === opt.id
                    ? `${opt.color} text-white shadow-lg scale-105`
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Bet Amount & Spin CTA */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
              {[25, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRouletteBetAmount(amt)}
                  className={`px-3 py-1 text-xs font-tech font-bold rounded-lg ${
                    rouletteBetAmount === amt ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button
              onClick={spinRoulette}
              disabled={rouletteSpinning}
              className="px-8 py-2.5 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {rouletteSpinning ? 'SPINNING WHEEL...' : `SPIN WHEEL (${rouletteBetAmount})`}
            </button>
          </div>
        </div>
      )}

      {/* GAME 2: NEON PLINKO CASCADE */}
      {selectedGame === 'plinko' && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="font-cyber text-xl font-bold text-white text-glow-cyan flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              NEON PLINKO CASCADE
            </h3>
            <p className="font-tech text-xs text-slate-400 mt-1">
              Drop gravity-defying quantum orbs down bouncing pegs into 10x jackpot bins!
            </p>
          </div>

          <div className="relative bg-slate-950 rounded-2xl border border-cyan-500/40 p-2 shadow-inner">
            <canvas ref={plinkoCanvasRef} width={400} height={360} className="w-[320px] md:w-[400px] h-[320px] md:h-[360px]" />
          </div>

          {/* Recent Multipliers */}
          {plinkoHistory.length > 0 && (
            <div className="flex items-center gap-2 my-3">
              <span className="font-tech text-xs text-slate-400 uppercase">RECENT:</span>
              {plinkoHistory.map((m, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-xs font-cyber font-bold ${
                    m >= 4 ? 'bg-rose-500/20 text-rose-300 border border-rose-500' : 'bg-slate-800 text-cyan-300'
                  }`}
                >
                  {m}x
                </span>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPlinkoBet(amt)}
                  className={`px-3 py-1 text-xs font-tech font-bold rounded-lg ${
                    plinkoBet === amt ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button
              onClick={dropPlinkoBall}
              disabled={plinkoDropping}
              className="px-8 py-2.5 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {plinkoDropping ? 'DROPPING...' : `DROP ORB (${plinkoBet})`}
            </button>
          </div>
        </div>
      )}

      {/* GAME 3: MECHA DRAGON ARENA */}
      {selectedGame === 'dragon_battle' && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="font-cyber text-xl font-bold text-white text-glow-gold flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-yellow-400" />
              CYBER DRAGON BATTLE ARENA
            </h3>
            <p className="font-tech text-xs text-slate-400 mt-1">
              Engage the Mecha-Dragon in high-stakes combat. Win 4X your wager upon victory!
            </p>
          </div>

          {/* Health Bars */}
          <div className="w-full max-w-md space-y-4 my-4">
            <div>
              <div className="flex justify-between text-xs font-cyber font-bold mb-1">
                <span className="text-rose-400">MECHA-DRAGON HP</span>
                <span className="text-rose-300">{dragonHp}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-500/30">
                <div className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-300" style={{ width: `${dragonHp}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-cyber font-bold mb-1">
                <span className="text-cyan-400">YOUR COMBAT SHIELD</span>
                <span className="text-cyan-300">{playerShield}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-cyan-500/30">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{ width: `${playerShield}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-2.5 my-3 text-center max-w-lg">
            <span className="font-tech text-sm text-yellow-300 font-semibold">{battleStatus}</span>
          </div>

          {/* Combat Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => startDragonDuel('heavy_plasma')}
              className="px-5 py-2.5 rounded-xl font-tech font-bold text-xs bg-rose-600/30 border border-rose-500 text-rose-200 hover:bg-rose-600/50 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              HEAVY PLASMA CANNON
            </button>
            <button
              onClick={() => startDragonDuel('counter_shield')}
              className="px-5 py-2.5 rounded-xl font-tech font-bold text-xs bg-cyan-600/30 border border-cyan-500 text-cyan-200 hover:bg-cyan-600/50 transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              DEFLECT & COUNTER
            </button>
            <button
              onClick={() => startDragonDuel('overload')}
              className="px-5 py-2.5 rounded-xl font-tech font-bold text-xs bg-purple-600/30 border border-purple-500 text-purple-200 hover:bg-purple-600/50 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              CORE OVERLOAD (RISKY)
            </button>
          </div>
        </div>
      )}

      {/* GAME 4: TREASURE VAULT MATRIX */}
      {selectedGame === 'matrix' && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="font-cyber text-xl font-bold text-white text-glow-cyan flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              TREASURE VAULT MATRIX
            </h3>
            <p className="font-tech text-xs text-slate-400 mt-1">
              Excavate cyber tiles to build your cash-out multiplier. Avoid the 3 quantum firewalls!
            </p>
          </div>

          {/* Multiplier / Status Header */}
          <div className="flex items-center gap-6 my-2">
            <div className="text-center">
              <div className="font-tech text-xs text-slate-400">CURRENT MULTIPLIER</div>
              <div className="font-cyber text-2xl font-black text-yellow-400 text-glow-gold">
                {matrixCurrentMult}x
              </div>
            </div>
            <div className="text-center">
              <div className="font-tech text-xs text-slate-400">POTENTIAL WIN</div>
              <div className="font-cyber text-2xl font-black text-cyan-400">
                {Math.round(matrixBet * matrixCurrentMult).toLocaleString()} <span className="text-xs">COINS</span>
              </div>
            </div>
          </div>

          {/* 5x5 Grid */}
          <div className="grid grid-cols-5 gap-2.5 my-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {matrixGrid.length > 0 ? (
              matrixGrid.map((cell, idx) => (
                <button
                  key={cell.id}
                  onClick={() => clickMatrixCell(idx)}
                  disabled={!matrixActive || cell.revealed}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border flex items-center justify-center font-bold text-lg transition ${
                    !cell.revealed
                      ? 'bg-slate-900 hover:bg-slate-800 border-cyan-500/30 text-cyan-400 hover:scale-105 shadow cursor-pointer'
                      : cell.isTrap
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_15px_#ff0055]'
                      : 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_15px_#10b981]'
                  }`}
                >
                  {cell.revealed ? (cell.isTrap ? '💥' : '💎') : '?'}
                </button>
              ))
            ) : (
              <div className="col-span-5 py-12 text-center font-tech text-sm text-slate-500">
                Press START EXCAVATION to initiate the 5x5 Quantum Vault
              </div>
            )}
          </div>

          {/* Cashout / Start Actions */}
          <div className="flex items-center gap-4 mt-2">
            {!matrixActive ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setMatrixBet(amt)}
                      className={`px-3 py-1 text-xs font-tech font-bold rounded-lg ${
                        matrixBet === amt ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startMatrixGame}
                  className="px-6 py-2.5 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  START EXCAVATION ({matrixBet})
                </button>
              </div>
            ) : (
              <button
                onClick={cashOutMatrix}
                disabled={matrixRevealedCount === 0}
                className="px-8 py-2.5 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition cursor-pointer"
              >
                CASH OUT ({Math.round(matrixBet * matrixCurrentMult).toLocaleString()} COINS)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
