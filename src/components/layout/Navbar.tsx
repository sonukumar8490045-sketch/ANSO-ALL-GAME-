import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { sound } from '../../services/sound';
import { Gamepad2, Plus, Volume2, VolumeX, Shield, Crown, User, Wallet, Sparkles, Menu, X, Download, Film, Rocket, Flame } from 'lucide-react';

interface NavbarProps {
  userCoins: number;
  profile: UserProfile;
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenWallet: () => void;
  onOpenVip: () => void;
  onOpenAdmin: () => void;
  onOpenAvatar: () => void;
  onOpenFileVault: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userCoins,
  profile,
  currentCategory,
  onSelectCategory,
  onOpenWallet,
  onOpenVip,
  onOpenAdmin,
  onOpenAvatar,
  onOpenFileVault,
}) => {
  const [muted, setMuted] = useState<boolean>(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleAudio = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
  };

  const navItems = [
    { id: 'all', label: 'LOBBY' },
    { id: 'slots', label: '3D SLOTS' },
    { id: 'fishing', label: '3D FISHING' },
    { id: 'racer', label: '3D RACER' },
    { id: 'crash', label: 'CYBER CRASH' },
    { id: 'fusion', label: 'FUSION' },
    { id: 'avatar', label: 'AVATAR' },
    { id: 'cinema', label: '3D VIDEO' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div
          onClick={() => {
            sound.playUiClick();
            onSelectCategory('all');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
            </div>
          </div>
          <div>
            <div className="font-cyber font-black text-sm md:text-base tracking-wider bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>FUTURE FUSION</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-tech uppercase">
                GAMES
              </span>
            </div>
            <div className="font-tech text-[10px] text-slate-400 tracking-widest uppercase">
              NEXT-GEN 3D GAMING PLATFORM
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playUiClick();
                if (item.id === 'avatar') {
                  onOpenAvatar();
                } else {
                  onSelectCategory(item.id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-cyber text-xs font-bold transition ${
                currentCategory === item.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions / Balance Bar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Virtual Coin Balance & Quick Topup */}
          <div
            onClick={() => {
              sound.playUiClick();
              onOpenWallet();
            }}
            className="flex items-center bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 rounded-xl px-2.5 py-1 gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)] transition"
          >
            <div className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-yellow-400 font-bold text-xs">
              🪙
            </div>
            <div className="text-right">
              <span className="font-cyber font-bold text-xs md:text-sm text-yellow-400 tabular-nums">
                {userCoins.toLocaleString()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playUiClick();
                onOpenWallet();
              }}
              className="w-5 h-5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition"
              title="Add Demo Coins"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* VIP Badge */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenVip();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 px-2.5 py-1.5 rounded-xl font-tech text-xs font-bold text-purple-300 transition"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <span>{profile.vipTier}</span>
          </button>

          {/* Avatar Profile Trigger */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenAvatar();
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl font-tech text-xs text-slate-300 transition"
            title="Custom 3D Avatar"
          >
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: profile.avatar.glowColor, borderColor: '#ffffff' }}
            />
            <span className="hidden md:inline font-bold">{profile.name}</span>
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={toggleAudio}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* File Vault & Download System Trigger */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenFileVault();
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-white transition"
            title="File Vault & Downloads"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Admin Dashboard Portal Toggle */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenAdmin();
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition"
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-cyan-500/30 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playUiClick();
                setMobileMenuOpen(false);
                if (item.id === 'avatar') {
                  onOpenAvatar();
                } else {
                  onSelectCategory(item.id);
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-cyber text-xs font-bold text-left transition ${
                currentCategory === item.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWallet();
              }}
              className="flex-1 py-2 bg-slate-900 rounded-lg text-xs font-tech font-bold text-cyan-400 text-center"
            >
              WALLET
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVip();
              }}
              className="flex-1 py-2 bg-slate-900 rounded-lg text-xs font-tech font-bold text-purple-400 text-center"
            >
              VIP REWARDS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFileVault();
              }}
              className="flex-1 py-2 bg-cyan-950/80 border border-cyan-400/40 rounded-lg text-xs font-tech font-bold text-cyan-300 text-center"
            >
              FILES
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
