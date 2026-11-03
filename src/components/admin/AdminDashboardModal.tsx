import React, { useState } from 'react';
import { AdminPlatformSettings, UserProfile } from '../../types';
import { sound } from '../../services/sound';
import { X, Sliders, Shield, Users, Activity, ToggleLeft, ToggleRight, Check, RefreshCw } from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminPlatformSettings;
  onSaveSettings: (settings: AdminPlatformSettings) => void;
  profile: UserProfile;
  userCoins: number;
  onCoinsChange: (coins: number) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onSaveSettings,
  profile,
  userCoins,
  onCoinsChange,
  onUpdateProfile,
}) => {
  const [settings, setSettings] = useState<AdminPlatformSettings>(adminSettings);
  const [activeTab, setActiveTab] = useState<'platform' | 'games' | 'player' | 'security'>('platform');
  const [coinsToAdd, setCoinsToAdd] = useState<string>('50000');
  const [savedNote, setSavedNote] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleGame = (gameKey: string) => {
    sound.playUiClick();
    const updated = {
      ...settings,
      gamesActive: {
        ...settings.gamesActive,
        [gameKey]: !settings.gamesActive[gameKey],
      },
    };
    setSettings(updated);
    onSaveSettings(updated);
  };

  const handleGrantCoins = () => {
    const amt = parseInt(coinsToAdd, 10);
    if (isNaN(amt) || amt <= 0) return;
    sound.playWin(3);
    onCoinsChange(userCoins + amt);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 3000);
  };

  const handleSetVip = (tier: UserProfile['vipTier']) => {
    sound.playUiClick();
    const updated = { ...profile, vipTier: tier };
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cyber text-lg font-bold text-white">FUTURE FUSION ADMIN CORE</h2>
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-cyber px-2 py-0.5 rounded font-black">
                  ROOT ACCESS
                </span>
              </div>
              <span className="font-tech text-xs text-slate-400">GAME ENGINE & SIMULATOR CONTROLS</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          {[
            { id: 'platform', label: 'METRICS & RTP', icon: Activity },
            { id: 'games', label: 'GAME MODULES', icon: Sliders },
            { id: 'player', label: 'PLAYER MANAGEMENT', icon: Users },
            { id: 'security', label: 'FAIRNESS AUDIT', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playUiClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 py-3 px-3 font-tech text-xs font-bold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* PLATFORM METRICS & RTP */}
          {activeTab === 'platform' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-tech text-[11px] text-slate-400 block uppercase">
                    SIMULATED ACTIVE PLAYERS
                  </span>
                  <div className="font-cyber text-xl font-bold text-cyan-300 mt-1">
                    {settings.simulatedPlayersCount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-tech text-[11px] text-slate-400 block uppercase">
                    GLOBAL PROGRESSIVE JACKPOT
                  </span>
                  <div className="font-cyber text-xl font-bold text-yellow-400 mt-1">
                    {settings.globalJackpot.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-tech text-[11px] text-slate-400 block uppercase">
                    ENGINE HIT FREQUENCY
                  </span>
                  <div className="font-cyber text-xl font-bold text-emerald-400 mt-1">
                    42.8%
                  </div>
                </div>
              </div>

              {/* RTP Slider */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tech text-xs text-slate-300 font-bold uppercase">
                    SIMULATED RETURN TO PLAYER (RTP):
                  </span>
                  <span className="font-cyber text-sm font-black text-cyan-400">
                    {settings.rtpSetting}%
                  </span>
                </div>
                <input
                  type="range"
                  min="94"
                  max="98.5"
                  step="0.1"
                  value={settings.rtpSetting}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const updated = { ...settings, rtpSetting: val };
                    setSettings(updated);
                    onSaveSettings(updated);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] font-tech text-slate-500 block">
                  Regulated statistical distribution rate across 3D slot reels and fusion engines.
                </span>
              </div>
            </div>
          )}

          {/* GAME MODULES */}
          {activeTab === 'games' && (
            <div className="space-y-2">
              <h4 className="font-cyber text-xs font-bold text-white mb-2 uppercase">
                ACTIVE GAME REPOSITORIES & STATUS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'dragon', title: '3D Cyber Dragon Slot' },
                  { key: 'space', title: '3D Space Odyssey Slot' },
                  { key: 'egypt', title: '3D Anubis Relic Slot' },
                  { key: 'treasure', title: '3D Quantum Vault Slot' },
                  { key: 'fantasy', title: '3D Arcana Mana Slot' },
                  { key: 'gold', title: '3D Royale Neon 777' },
                  { key: 'fishing_3d', title: '3D Deep Sea Fishing' },
                  { key: 'cyber_roulette', title: 'Cyber Roulette 2088' },
                  { key: 'neon_plinko', title: 'Neon Plinko Cascade' },
                  { key: 'dragon_battle', title: 'Mecha-Dragon Arena' },
                ].map((g) => {
                  const isActive = settings.gamesActive[g.key] !== false;
                  return (
                    <div
                      key={g.key}
                      onClick={() => handleToggleGame(g.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isActive
                          ? 'bg-slate-950 border-cyan-500/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="font-tech text-xs font-bold">{g.title}</span>
                      <span className={`text-xs font-cyber ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {isActive ? 'ENABLED' : 'PAUSED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLAYER MANAGEMENT */}
          {activeTab === 'player' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-cyber text-xs font-bold text-white uppercase">
                  MANUAL COIN BALANCE ADJUSTMENT (DEBUG / DEMO)
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={coinsToAdd}
                    onChange={(e) => setCoinsToAdd(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-cyber text-cyan-300 focus:outline-none"
                  />
                  <button
                    onClick={handleGrantCoins}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-cyber text-xs font-bold rounded-lg transition"
                  >
                    GRANT COINS
                  </button>
                </div>
                {savedNote && (
                  <div className="text-xs font-tech text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Balance credited successfully.
                  </div>
                )}
              </div>

              {/* VIP Rank Override */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-cyber text-xs font-bold text-white uppercase">
                  VIP MEMBERSHIP TIER OVERRIDE
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CYBER_OVERLORD'] as UserProfile['vipTier'][]).map(
                    (tier) => (
                      <button
                        key={tier}
                        onClick={() => handleSetVip(tier)}
                        className={`px-3 py-1.5 rounded-lg font-tech text-xs font-bold border transition ${
                          profile.vipTier === tier
                            ? 'bg-purple-600 border-purple-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FAIRNESS AUDIT */}
          {activeTab === 'security' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-cyber text-xs font-bold">
                <Shield className="w-4 h-4" />
                SIMULATED RNG CRYPTOGRAPHIC HASH AUDIT
              </div>
              <p className="font-tech text-xs text-slate-300 leading-relaxed">
                Platform games calculate outcomes using deterministic pseudorandom seed strings and cryptographic client-seed hashes.
              </p>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 break-all">
                Hash: 0x9b4a8e23f7d14c990238ab761e0fcd821a8843c089d71cba8829f44b029
              </div>
              <div className="text-[11px] font-tech text-slate-400">
                Status: Verified provably fair · Zero external tamper vulnerability.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
