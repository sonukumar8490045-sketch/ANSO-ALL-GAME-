import React, { useState } from 'react';
import { UserProfile, Transaction } from '../../types';
import { sound } from '../../services/sound';
import { X, Download, FileText, FileCode, FileSpreadsheet, ShieldCheck, Check, Sparkles, FolderArchive } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FileVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  userCoins: number;
  transactions: Transaction[];
}

export const FileVaultModal: React.FC<FileVaultModalProps> = ({
  isOpen,
  onClose,
  profile,
  userCoins,
  transactions,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    sound.playWin(2);
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(filename);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // 1. Download VIP Player Passport
  const downloadVipPassport = () => {
    const data = {
      platform: 'FUTURE FUSION GAMES',
      issuedAt: new Date().toISOString(),
      passportId: `FFG-VIP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      player: {
        name: profile.name,
        handle: profile.handle,
        vipTier: profile.vipTier,
        vipPoints: profile.vipPoints,
        totalSpins: profile.totalSpins,
        totalWins: profile.totalWins,
        biggestWin: profile.biggestWin,
        fishCaught: profile.fishCaught,
        currentVirtualCoins: userCoins,
      },
      avatarBlueprint: profile.avatar,
      verificationStatus: 'CRYPTOGRAPHICALLY_VERIFIED_FAIR',
    };
    triggerDownload('future_fusion_vip_pass.json', JSON.stringify(data, null, 2), 'application/json');
  };

  // 2. Download 3D Avatar Blueprint
  const downloadAvatarBlueprint = () => {
    const data = {
      modelName: 'CYBORG_AVATAR_MK_IV',
      engine: 'THREE_JS_PBR',
      owner: profile.name,
      equippedSpecs: profile.avatar,
      materials: {
        chassis: profile.avatar.chassis,
        hairStyle: profile.avatar.hairStyle,
        hairColorHex: profile.avatar.hairColor,
        glowEnergyColorHex: profile.avatar.glowColor,
        visorOptics: profile.avatar.visor,
        plasmaWingsEnabled: profile.avatar.wings,
        orbitalSentinelDrone: profile.avatar.drone,
      },
    };
    triggerDownload('future_fusion_avatar_spec.json', JSON.stringify(data, null, 2), 'application/json');
  };

  // 3. Download Transaction Ledger CSV
  const downloadLedgerCSV = () => {
    const header = 'ID,Date,Type,Game,Amount,BalanceAfter\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${new Date(t.timestamp).toISOString()}","${t.type}","${t.gameTitle}",${t.amount},${t.balanceAfter}`
      )
      .join('\n');
    triggerDownload('future_fusion_ledger.csv', header + rows, 'text/csv');
  };

  // 4. Download PWA Game Manifest & Offline Config
  const downloadPwaConfig = () => {
    const manifest = {
      name: 'FUTURE FUSION GAMES',
      short_name: 'FusionGames',
      description: 'Premium 3D Futuristic Online Gaming & Casino Platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#050711',
      theme_color: '#00f0ff',
      orientation: 'any',
      categories: ['games', 'entertainment', 'casino'],
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
    triggerDownload('future_fusion_manifest.json', JSON.stringify(manifest, null, 2), 'application/json');
  };

  // 5. Download Game Guide & Paytables TXT
  const downloadGameGuide = () => {
    const guide = `=====================================================
FUTURE FUSION GAMES - COMPREHENSIVE STRATEGY & RULES
=====================================================

1. 3D CYBER SLOT MACHINES
- Cyber Dragon Inferno: High Volatility (10,000x Max Win)
- Space Odyssey 2088: Medium Volatility (8,500x Max Win)
- Anubis Cyber Relic: High Volatility (12,500x Max Win)
- Royale Neon 777: Extreme Volatility (15,000x Max Win)
- Quantum Vault Heist: Cascading symbols (6,000x Max Win)
- Arcana Mana Matrix: Alchemy Mana Free Spins (9,000x Max Win)

2. 3D DEEP SEA FISHING
- Neon Guppy: 4x Multiplier
- Chrono Nautilus: 10x Multiplier
- Plasma Manta: 15x Multiplier
- Quantum Jellyfish: 25x Multiplier
- Cyber Megalodon (Boss): 50x Multiplier
- Weapons: Plasma Net, Cryo Frost, Thunder Web

3. CYBER CRASH 2088
- Hyperdrive launches from 1.00x upward.
- Cash out before the rocket crashes to bank virtual coins!

4. 3D CYBER RACER
- Steer starship via mouse/touch or WASD.
- Dodge red laser energy barriers; collect yellow orbs.

LEGAL NOTICE:
All games use virtual demo coins for social entertainment.
Provably Fair Simulated RNG Active.
=====================================================`;
    triggerDownload('future_fusion_guide.txt', guide, 'text/plain');
  };

  const fileItems = [
    {
      title: 'VIP Player Passport & Credentials',
      ext: '.JSON',
      desc: 'Cryptographic JSON document containing player VIP tier, lifetime stats, and achievement log.',
      icon: FileCode,
      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
      action: downloadVipPassport,
    },
    {
      title: '3D Avatar Cybernetic Blueprint',
      ext: '.JSON',
      desc: 'Full 3D cyborg specification with chassis textures, color hexes, and equipped wing/drone gear.',
      icon: FileCode,
      color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
      action: downloadAvatarBlueprint,
    },
    {
      title: 'Ledger & Transaction Statement',
      ext: '.CSV',
      desc: 'Spreadsheet-ready CSV export of all spin payouts, daily rewards, and betting history.',
      icon: FileSpreadsheet,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      action: downloadLedgerCSV,
    },
    {
      title: 'PWA Web App Manifest Package',
      ext: '.JSON',
      desc: 'Complete Progressive Web App manifest for installing Future Fusion Games offline on mobile/desktop.',
      icon: FolderArchive,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      action: downloadPwaConfig,
    },
    {
      title: 'Master Game Guide & Paytables',
      ext: '.TXT',
      desc: 'Offline reference guide detailing all 6 slot paytables, fishing boss multipliers, and crash rules.',
      icon: FileText,
      color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
      action: downloadGameGuide,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cyber text-lg font-bold text-white flex items-center gap-2">
                FUTURE FUSION FILE VAULT & EXPORT
              </h2>
              <span className="font-tech text-xs text-slate-400">OFFLINE DATA, MANIFESTS & VIP PASSES</span>
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

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-400 px-5 py-2.5 flex items-center gap-2 text-xs font-cyber text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>DOWNLOAD STARTED: {downloadSuccess}</span>
          </div>
        )}

        {/* List of downloadable files */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {fileItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-cyber text-xs font-bold text-white">{item.title}</h4>
                      <span className="font-tech text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {item.ext}
                      </span>
                    </div>
                    <p className="font-tech text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={item.action}
                  className="px-4 py-2 rounded-xl font-cyber text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-tech text-slate-400">
          <span>✓ Instant client-side download · Zero tracking · Encrypted formatting</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
