import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { sound } from '../../services/sound';
import { X, Crown, Award, Trophy, Calendar, Check, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VipRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  dailyStatus: { canClaim: boolean; currentDay: number; nextReward: number };
  onClaimDaily: () => void;
  onClaimAchievement: (achievementId: string, reward: number) => void;
}

export const VipRewardsModal: React.FC<VipRewardsModalProps> = ({
  isOpen,
  onClose,
  profile,
  dailyStatus,
  onClaimDaily,
  onClaimAchievement,
}) => {
  const [activeTab, setActiveTab] = useState<'vip' | 'daily' | 'achievements' | 'leaderboard'>('vip');

  if (!isOpen) return null;

  const vipTiers = [
    { name: 'BRONZE', minPts: 0, perk: 'Standard Daily Bonus, 1x Free Spins' },
    { name: 'SILVER', minPts: 1000, perk: '+15% Daily Bonus, Silver Avatar Chassises', current: profile.vipTier === 'SILVER' },
    { name: 'GOLD', minPts: 5000, perk: '+30% Daily Bonus, 3D Gold Avatar Gear, No Turbo Delay', current: profile.vipTier === 'GOLD' },
    { name: 'PLATINUM', minPts: 20000, perk: '+50% Daily Bonus, Hologram Visor, Weekly High Roller Pool', current: profile.vipTier === 'PLATINUM' },
    { name: 'DIAMOND', minPts: 50000, perk: '+100% Daily Bonus, Orbital Drone Companion, Diamond Matrix Slots', current: profile.vipTier === 'DIAMOND' },
    { name: 'CYBER OVERLORD', minPts: 100000, perk: '+200% Daily Bonus, Plasma Holographic Wings, 1-on-1 VIP Host', current: profile.vipTier === 'CYBER_OVERLORD' },
  ];

  const dailyRewards = [
    { day: 1, coins: 2000 },
    { day: 2, coins: 3500 },
    { day: 3, coins: 5000 },
    { day: 4, coins: 7500 },
    { day: 5, coins: 10000 },
    { day: 6, coins: 15000 },
    { day: 7, coins: 25000, big: true },
  ];

  const simulatedLeaderboard = [
    { rank: 1, name: 'Valkyrie_Neo', coins: '1,492,000', vip: 'CYBER OVERLORD', badge: '👑' },
    { rank: 2, name: 'CyberSamurai_X', coins: '984,500', vip: 'DIAMOND', badge: '🥈' },
    { rank: 3, name: profile.name, coins: profile.totalWins.toLocaleString(), vip: profile.vipTier, badge: '🥉', isUser: true },
    { rank: 4, name: 'GlitchMaster_88', coins: '620,000', vip: 'PLATINUM', badge: '4' },
    { rank: 5, name: 'NovaDrifter', coins: '480,200', vip: 'GOLD', badge: '5' },
    { rank: 6, name: 'DeepSeaSniper', coins: '350,000', vip: 'GOLD', badge: '6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(189,0,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cyber text-lg font-bold text-white flex items-center gap-2">
                VIP CLUB & REWARDS
              </h2>
              <span className="font-tech text-xs text-slate-400">LOYALTY PERKS, DAILY CALENDAR & MISSIONS</span>
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
            { id: 'vip', label: 'VIP TIERS', icon: Crown },
            { id: 'daily', label: 'DAILY STREAK', icon: Calendar },
            { id: 'achievements', label: 'ACHIEVEMENTS', icon: Award },
            { id: 'leaderboard', label: 'LEADERBOARD', icon: Trophy },
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
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* VIP TIERS TAB */}
          {activeTab === 'vip' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-950/60 to-slate-950 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cyber text-sm font-bold text-yellow-400">
                    CURRENT RANK: {profile.vipTier}
                  </span>
                  <span className="font-tech text-xs text-slate-400">
                    {profile.vipPoints} / 5,000 XP TO NEXT TIER
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-purple-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"
                    style={{ width: `${profile.vipProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {vipTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      tier.current
                        ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(189,0,255,0.2)]'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cyber text-xs font-bold text-white">{tier.name}</span>
                        {tier.current && (
                          <span className="bg-purple-500/30 text-purple-300 border border-purple-400 text-[10px] font-cyber px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="font-tech text-xs text-slate-400 mt-1">{tier.perk}</div>
                    </div>
                    <span className="font-tech text-xs text-slate-500">{tier.minPts.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DAILY REWARDS CALENDAR */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-cyber text-base font-bold text-white">7-DAY DAILY BONUS MATRIX</h4>
                <p className="font-tech text-xs text-slate-400 mt-1">
                  Log in consecutively every day to unlock escalating rewards, culminating in a 25,000 coin jackpot!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                {dailyRewards.map((r) => {
                  const isClaimed = r.day < dailyStatus.currentDay || (!dailyStatus.canClaim && r.day === dailyStatus.currentDay);
                  const isToday = r.day === dailyStatus.currentDay && dailyStatus.canClaim;

                  return (
                    <div
                      key={r.day}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between ${
                        isToday
                          ? 'bg-gradient-to-b from-yellow-500/20 to-purple-500/20 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.3)] animate-pulse'
                          : isClaimed
                          ? 'bg-slate-950/40 border-slate-800 opacity-60'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="font-tech text-xs text-slate-400 uppercase">DAY {r.day}</span>
                      <div className="my-2">
                        <span className="text-2xl">{r.big ? '👑' : '🪙'}</span>
                        <div className="font-cyber font-bold text-sm text-yellow-300">
                          +{r.coins.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-tech font-bold uppercase text-slate-500">
                        {isClaimed ? 'CLAIMED' : isToday ? 'READY!' : 'LOCKED'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onClaimDaily}
                disabled={!dailyStatus.canClaim}
                className="w-full py-3 rounded-xl font-cyber font-black text-sm bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-40 transition cursor-pointer"
              >
                {dailyStatus.canClaim
                  ? `CLAIM TODAY'S REWARD (+${dailyStatus.nextReward.toLocaleString()} COINS)`
                  : 'NEXT BONUS READY TOMORROW'}
              </button>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="space-y-2.5">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="font-cyber text-xs font-bold text-white">{ach.title}</div>
                      <div className="font-tech text-xs text-slate-400">{ach.description}</div>
                    </div>
                  </div>

                  <div>
                    {ach.claimed ? (
                      <span className="font-tech text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> CLAIMED
                      </span>
                    ) : ach.completed ? (
                      <button
                        onClick={() => {
                          sound.playWin(3);
                          onClaimAchievement(ach.id, ach.reward);
                          confetti({ particleCount: 50 });
                        }}
                        className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-cyber font-bold text-xs rounded-lg transition"
                      >
                        CLAIM +{ach.reward}
                      </button>
                    ) : (
                      <span className="font-tech text-xs text-slate-500">+{ach.reward} COINS</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              <h4 className="font-cyber text-xs font-bold text-white mb-2 uppercase">
                GLOBAL HIGH ROLLERS & CYBER JACKPOTS
              </h4>
              <div className="space-y-1.5">
                {simulatedLeaderboard.map((item) => (
                  <div
                    key={item.rank}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      item.isUser
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-cyber font-bold text-sm text-yellow-400 w-6 text-center">
                        {item.badge}
                      </span>
                      <div>
                        <div className="font-tech text-xs font-bold text-white flex items-center gap-1.5">
                          {item.name}
                          {item.isUser && (
                            <span className="bg-cyan-400 text-slate-950 text-[9px] font-cyber px-1.5 py-0.2 rounded font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="font-tech text-[10px] text-purple-300">{item.vip}</div>
                      </div>
                    </div>
                    <div className="font-cyber text-xs font-bold text-cyan-300">
                      {item.coins} <span className="text-[10px] text-slate-500">COINS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
