import React from 'react';
import { GameMetadata, SlotThemeId, UserProfile } from '../../types';
import { SLOT_THEMES } from '../../services/slotThemes';
import { sound } from '../../services/sound';
import { Play, Sparkles, Flame, Trophy, Crown, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface HomeDashboardProps {
  userCoins: number;
  profile: UserProfile;
  dailyStatus: { canClaim: boolean; currentDay: number; nextReward: number };
  onClaimDaily: () => void;
  onLaunchSlot: (themeId: SlotThemeId) => void;
  onLaunchFishing: () => void;
  onLaunchRacer: () => void;
  onLaunchCrash: () => void;
  onLaunchCinema: () => void;
  onLaunchFusion: () => void;
  onOpenAvatar: () => void;
  onOpenWallet: () => void;
  onOpenVip: () => void;
  onOpenFileVault: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userCoins,
  profile,
  dailyStatus,
  onClaimDaily,
  onLaunchSlot,
  onLaunchFishing,
  onLaunchRacer,
  onLaunchCrash,
  onLaunchCinema,
  onLaunchFusion,
  onOpenAvatar,
  onOpenWallet,
  onOpenVip,
  onOpenFileVault,
}) => {
  const liveWinners = [
    { user: 'CyberRunner_9', game: 'Cyber Dragon Inferno', amount: 48500, time: '2m ago' },
    { user: 'NeoValkyrie', game: '3D Deep Sea Fishing', amount: 25000, time: '5m ago' },
    { user: 'KryptonAce', game: 'Royale Neon 777', amount: 120000, time: '8m ago', jackpot: true },
    { user: 'QuantumZero', game: 'Space Odyssey 2088', amount: 32000, time: '12m ago' },
  ];

  const slotCards: { id: SlotThemeId; name: string; tag: string; multiplier: string; icon: string; color: string; desc: string }[] = [
    {
      id: 'dragon',
      name: 'Cyber Dragon Inferno',
      tag: '🔥 HOT',
      multiplier: '10,000X',
      icon: '🐲',
      color: 'from-rose-500/20 to-amber-500/20 border-rose-500/40',
      desc: 'High-volatility mecha-draconic fury with flame respins',
    },
    {
      id: 'space',
      name: 'Space Odyssey 2088',
      tag: '🚀 POPULAR',
      multiplier: '8,500X',
      icon: '🌌',
      color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40',
      desc: 'Cosmic pulsar spins, starship wilds, and zero-g free spins',
    },
    {
      id: 'egypt',
      name: 'Anubis Cyber Relic',
      tag: '⚡ FEATURED',
      multiplier: '12,500X',
      icon: '🐺',
      color: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/40',
      desc: 'Hieroglyphs forged in nano-gold and hyper-pyramid multipliers',
    },
    {
      id: 'gold',
      name: 'Royale Neon 777',
      tag: '👑 JACKPOT',
      multiplier: '15,000X',
      icon: '🎰',
      color: 'from-amber-400/20 to-rose-500/20 border-amber-400/50',
      desc: 'Classic high-roller neon Vegas spirit fused with cybernetics',
    },
    {
      id: 'treasure',
      name: 'Quantum Vault Heist',
      tag: '💎 HEIST',
      multiplier: '6,000X',
      icon: '🏦',
      color: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/40',
      desc: 'Hack the planetary credit reserve with cascading symbols',
    },
    {
      id: 'fantasy',
      name: 'Arcana Mana Matrix',
      tag: '✨ MYSTIC',
      multiplier: '9,000X',
      icon: '🔮',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40',
      desc: 'Futuristic alchemy, mana singularities, and spell runes',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-10 py-6">
      {/* Hero Marquee Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-10 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Glow ambient background rings */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-tech text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXT-GEN 3D GAMING METAVERSE</span>
          </div>

          <h1 className="font-cyber text-3xl md:text-5xl font-black text-white leading-tight">
            FUTURE FUSION <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">
              CYBER GAMES
            </span>
          </h1>

          <p className="font-tech text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
            Experience ultra-smooth 3D mechanical slots, deep-sea plasma fishing tournaments, customizable 3D cyber avatars, and casino fusion games.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => {
                sound.playUiClick();
                onLaunchSlot('dragon');
              }}
              className="px-6 py-3 rounded-xl font-cyber font-black text-xs md:text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              PLAY 3D DRAGON SLOT
            </button>

            <button
              onClick={() => {
                sound.playUiClick();
                onLaunchFishing();
              }}
              className="px-6 py-3 rounded-xl font-cyber font-bold text-xs md:text-sm bg-slate-900 hover:bg-slate-800 border border-cyan-400/40 text-cyan-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <span>3D DEEP SEA FISHING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Right: Live Progressive Jackpot Matrix */}
        <div className="relative z-10 w-full md:w-80 bg-slate-950/80 border border-yellow-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-yellow-400 font-cyber text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            GLOBAL PROGRESSIVE POOL
          </div>
          <div className="font-cyber font-black text-2xl md:text-3xl text-yellow-300 text-glow-gold tabular-nums my-2">
            2,485,920
          </div>
          <span className="font-tech text-xs text-slate-400 uppercase tracking-widest">
            VIRTUAL DEMO COINS
          </span>

          {/* Daily Reward Mini Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800 w-full">
            <div className="flex items-center justify-between text-xs font-tech mb-2">
              <span className="text-slate-400">DAILY REWARD:</span>
              <span className="text-yellow-400 font-bold">DAY {dailyStatus.currentDay} OF 7</span>
            </div>
            <button
              onClick={onClaimDaily}
              disabled={!dailyStatus.canClaim}
              className="w-full py-2 rounded-xl font-cyber font-bold text-xs bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition disabled:opacity-40 cursor-pointer"
            >
              {dailyStatus.canClaim
                ? `CLAIM +${dailyStatus.nextReward.toLocaleString()} COINS`
                : 'CLAIMED TODAY'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Winners Feed Marquee */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-4 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-cyber font-bold text-cyan-400 shrink-0">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>LIVE WINNERS:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-tech">
          {liveWinners.map((w, idx) => (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold text-white">{w.user}</span>
              <span className="text-slate-400">won</span>
              <span className="font-cyber font-bold text-yellow-400">
                +{w.amount.toLocaleString()} COINS
              </span>
              <span className="text-[10px] text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {w.game}
              </span>
              <span className="text-[10px] text-slate-500">{w.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: 3D SLOTS COLLECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              3D SLOT MACHINE SUITE
            </h2>
            <p className="font-tech text-xs text-slate-400">
              Interactive 3D spinning reels, mechanical pull levers, and themes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slotCards.map((slot) => (
            <div
              key={slot.id}
              className={`rounded-2xl border p-5 bg-gradient-to-br ${slot.color} bg-slate-900/80 shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400 transition-all flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{slot.icon}</span>
                  <span className="font-cyber text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-cyan-500/30">
                    {slot.tag}
                  </span>
                </div>
                <h3 className="font-cyber font-bold text-base text-white group-hover:text-cyan-300 transition">
                  {slot.name}
                </h3>
                <p className="font-tech text-xs text-slate-300 mt-1 leading-relaxed">
                  {slot.desc}
                </p>
                <div className="mt-3 flex items-center justify-between font-tech text-xs">
                  <span className="text-slate-400">MAX WIN:</span>
                  <span className="font-cyber font-bold text-yellow-400">{slot.multiplier}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playUiClick();
                  onLaunchSlot(slot.id);
                }}
                className="mt-4 w-full py-2.5 rounded-xl font-cyber font-bold text-xs bg-slate-950 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 border border-cyan-500/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                LAUNCH 3D MACHINE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: 3D FISHING & AVATAR STUDIO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Deep Sea Fishing Banner */}
        <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase">
                3D SIMULATION
              </span>
              <span className="font-tech text-xs text-yellow-400 font-bold">50X BOSS SHARKS</span>
            </div>
            <h3 className="font-cyber text-2xl font-black text-white">
              DEEP SEA 3D FISHING
            </h3>
            <p className="font-tech text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Descend into a neon underwater ocean. Command a high-tech Plasma Harpoon turret to capture swimming cybernetic sharks, electric rays, and quantum jellyfish for coin jackpots.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onLaunchFishing();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-black text-xs md:text-sm bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,255,170,0.4)] hover:brightness-110 transition cursor-pointer"
          >
            ENTER 3D OCEAN TOURNAMENT
          </button>
        </div>

        {/* 3D Avatar Customizer Card */}
        <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase">
                CYBERNETIC STUDIO
              </span>
              <span className="font-tech text-xs text-purple-300 font-bold">VIP ACCESS</span>
            </div>
            <h3 className="font-cyber text-2xl font-black text-white">
              CUSTOM 3D CYBORG AVATAR
            </h3>
            <p className="font-tech text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Design and assemble your personal 3D gaming cyborg. Choose titanium or obsidian chassis, neon energy crests, tactical visors, holographic wings, and orbital drones.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenAvatar();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-black text-xs md:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(189,0,255,0.4)] hover:brightness-110 transition cursor-pointer"
          >
            OPEN 3D AVATAR STUDIO
          </button>
        </div>
      </div>

      {/* SECTION 3: FUSION CASINO GAMES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              FUSION CASINO SUITE
            </h2>
            <p className="font-tech text-xs text-slate-400">
              Cyber Roulette 2088, Neon Plinko Cascade, Dragon Arena, and Treasure Matrix
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onLaunchFusion();
            }}
            className="font-tech text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'roulette', title: 'Cyber Roulette 2088', icon: '⚡', mult: '100X LIGHTNING', desc: 'Quantum sector wheel with lightning strikes' },
            { id: 'plinko', title: 'Neon Plinko Cascade', icon: '🔮', mult: '10X JACKPOT', desc: 'Gravity orb drop with bouncing neon pegs' },
            { id: 'dragon_battle', title: 'Mecha-Dragon Arena', icon: '🐲', mult: '4X VICTORY', desc: 'Tactical duel against the cybernetic boss' },
            { id: 'matrix', title: 'Treasure Vault Matrix', icon: '💎', mult: 'DYNAMIC CASHOUT', desc: '5x5 quantum vault excavation' },
          ].map((game) => (
            <div
              key={game.id}
              onClick={() => {
                sound.playUiClick();
                onLaunchFusion();
              }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl">{game.icon}</span>
                <h4 className="font-cyber text-sm font-bold text-white mt-2">{game.title}</h4>
                <p className="font-tech text-xs text-slate-400 mt-1">{game.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-tech">
                <span className="text-slate-500">PAYOUT:</span>
                <span className="font-cyber font-bold text-yellow-400">{game.mult}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: NEW 3D CYBER RACER & CYBER CRASH (USER REQUESTED NEW GAMES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D Cyber Space Racer Card */}
        <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 uppercase">
                NEW 3D GAME
              </span>
              <span className="font-tech text-xs text-cyan-300 font-bold">50X WARP SPEED</span>
            </div>
            <h3 className="font-cyber text-2xl font-black text-white">
              3D CYBER SPACE RACER
            </h3>
            <p className="font-tech text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Pilot a custom delta-wing starship through an infinite glowing neon warp tunnel. Dodge red laser barrier pylons, fly through rings, collect gold cyber-orbs, and cash out multipliers before shields collapse.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onLaunchRacer();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-black text-xs md:text-sm bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition cursor-pointer"
          >
            PLAY 3D SPACE RACER
          </button>
        </div>

        {/* Cyber Crash 2088 Rocket Card */}
        <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 uppercase">
                NEW MULTIPLIER GAME
              </span>
              <span className="font-tech text-xs text-yellow-400 font-bold">UP TO 100X</span>
            </div>
            <h3 className="font-cyber text-2xl font-black text-white">
              CYBER CRASH 2088
            </h3>
            <p className="font-tech text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Watch the cybernetic quantum rocket ascend with exponential multipliers. Time your nerve and hit Cash Out before the hyperdrive detonates. Compete live with online simulated pilots!
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onLaunchCrash();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-black text-xs md:text-sm bg-gradient-to-r from-rose-500 via-purple-600 to-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:brightness-110 transition cursor-pointer"
          >
            PLAY CYBER CRASH ROCKET
          </button>
        </div>
      </div>

      {/* SECTION 5: 3D FUTURE VIDEO & FILE VAULT BANNER (USER REQUESTED VIDEO & FILES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D Holo-Cinema Video Card */}
        <div className="rounded-3xl border border-cyan-500/40 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase">
                HOLO-THEATER
              </span>
              <span className="font-tech text-xs text-slate-400">4K 60FPS</span>
            </div>
            <h3 className="font-cyber text-xl font-black text-white">
              3D FUTURE CINEMATIC TRAILERS
            </h3>
            <p className="font-tech text-xs text-slate-300 mt-2 leading-relaxed">
              Watch official Future Fusion 2088 cinematic trailers, Deep Sea Megalodon teasers, audio waveform visualizers, and narrative gameplay previews.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onLaunchCinema();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-cyan-400/50 text-cyan-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
          >
            WATCH 3D FUTURE VIDEOS
          </button>
        </div>

        {/* File Vault & Export System Card */}
        <div className="rounded-3xl border border-yellow-500/40 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 uppercase">
                DOWNLOAD CENTER
              </span>
              <span className="font-tech text-xs text-yellow-400 font-bold">CLIENT EXPORT</span>
            </div>
            <h3 className="font-cyber text-xl font-black text-white">
              FILE VAULT & OFFLINE DOWNLOADS
            </h3>
            <p className="font-tech text-xs text-slate-300 mt-2 leading-relaxed">
              Download your VIP Player Passport (JSON), 3D Avatar Blueprint (JSON), Ledger statement (CSV), PWA offline package (JSON), and Master Game Guides (TXT).
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenFileVault();
            }}
            className="mt-6 w-full py-3 rounded-xl font-cyber font-bold text-xs bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(255,215,0,0.3)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            OPEN FILE VAULT & DOWNLOADS
          </button>
        </div>
      </div>
    </div>
  );
};
