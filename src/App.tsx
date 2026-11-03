import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { SlotMachine3D } from './components/3d/SlotMachine3D';
import { FishingGame3D } from './components/3d/FishingGame3D';
import { CyberRacer3D } from './components/3d/CyberRacer3D';
import { AvatarStudio3D } from './components/3d/AvatarStudio3D';
import { FusionGames } from './components/games/FusionGames';
import { CyberCrashRocket } from './components/games/CyberCrashRocket';
import { CyberVideoPlayer } from './components/media/CyberVideoPlayer';
import { FileVaultModal } from './components/download/FileVaultModal';
import { WalletModal } from './components/wallet/WalletModal';
import { VipRewardsModal } from './components/vip/VipRewardsModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { storage } from './services/storage';
import { SLOT_THEMES } from './services/slotThemes';
import { sound } from './services/sound';
import { SlotThemeId, UserProfile, AdminPlatformSettings, Transaction, AvatarCustomization } from './types';
import { ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'lobby' | 'slot' | 'fishing' | 'racer' | 'crash' | 'fusion' | 'avatar' | 'cinema'>('lobby');
  const [selectedSlotTheme, setSelectedSlotTheme] = useState<SlotThemeId>('dragon');

  // Modals state
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [vipOpen, setVipOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [fileVaultOpen, setFileVaultOpen] = useState<boolean>(false);

  // Persistent user state
  const [coins, setCoins] = useState<number>(() => storage.getCoins());
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [adminSettings, setAdminSettings] = useState<AdminPlatformSettings>(() => storage.getAdminSettings());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [dailyStatus, setDailyStatus] = useState(() => storage.getDailyClaimStatus());

  // Keep coins synced with local storage
  const handleCoinsChange = (newCoins: number) => {
    setCoins(newCoins);
    storage.setCoins(newCoins);
  };

  // Record a spin or tournament win
  const handleRecordWin = (winAmount: number, bet: number) => {
    if (winAmount > 0) {
      const updatedWins = profile.totalWins + winAmount;
      const biggest = Math.max(profile.biggestWin, winAmount);
      const pointsEarned = Math.round(bet * 0.1);
      const updatedPts = profile.vipPoints + pointsEarned;

      // Calculate VIP progress
      let tier = profile.vipTier;
      if (updatedPts >= 50000) tier = 'CYBER_OVERLORD';
      else if (updatedPts >= 25000) tier = 'DIAMOND';
      else if (updatedPts >= 10000) tier = 'PLATINUM';
      else if (updatedPts >= 3000) tier = 'GOLD';
      else if (updatedPts >= 1000) tier = 'SILVER';

      const updatedProfile: UserProfile = {
        ...profile,
        totalWins: updatedWins,
        biggestWin: biggest,
        totalSpins: profile.totalSpins + 1,
        vipPoints: updatedPts,
        vipTier: tier,
      };

      setProfile(updatedProfile);
      storage.saveProfile(updatedProfile);

      // Record transaction
      const newTx = storage.addTransaction({
        type: 'WIN',
        gameTitle:
          currentView === 'slot'
            ? SLOT_THEMES[selectedSlotTheme].name
            : currentView === 'racer'
            ? '3D Cyber Space Racer'
            : currentView === 'crash'
            ? 'Cyber Crash 2088 Rocket'
            : 'Fusion Game',
        amount: winAmount,
        balanceAfter: coins + winAmount - bet,
      });
      setTransactions((prev) => [newTx, ...prev].slice(0, 50));
    }
  };

  // Record fishing catch
  const handleCatchRecord = (fishName: string, coinsEarned: number) => {
    const updatedCount = profile.fishCaught + 1;
    const updatedProfile = { ...profile, fishCaught: updatedCount };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);

    const newTx = storage.addTransaction({
      type: 'WIN',
      gameTitle: `Deep Sea Catch: ${fishName}`,
      amount: coinsEarned,
      balanceAfter: coins + coinsEarned,
    });
    setTransactions((prev) => [newTx, ...prev].slice(0, 50));
  };

  // Claim Daily Rewards
  const handleClaimDaily = () => {
    if (!dailyStatus.canClaim) return;
    const { rewardAmount } = storage.claimDailyReward();
    sound.playJackpot();
    const newBalance = coins + rewardAmount;
    handleCoinsChange(newBalance);

    const newTx = storage.addTransaction({
      type: 'DAILY_REWARD',
      gameTitle: `Day ${dailyStatus.currentDay} Daily Login Bonus`,
      amount: rewardAmount,
      balanceAfter: newBalance,
    });
    setTransactions((prev) => [newTx, ...prev].slice(0, 50));
    setDailyStatus(storage.getDailyClaimStatus());
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // Claim Achievement
  const handleClaimAchievement = (achievementId: string, reward: number) => {
    const updatedAchievements = profile.achievements.map((a) =>
      a.id === achievementId ? { ...a, claimed: true } : a
    );
    const updatedProfile = { ...profile, achievements: updatedAchievements };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);

    const newBalance = coins + reward;
    handleCoinsChange(newBalance);

    const newTx = storage.addTransaction({
      type: 'ACHIEVEMENT',
      gameTitle: 'Achievement Claim',
      amount: reward,
      balanceAfter: newBalance,
    });
    setTransactions((prev) => [newTx, ...prev].slice(0, 50));
  };

  // Save Avatar
  const handleSaveAvatar = (newAvatar: AvatarCustomization) => {
    const updated = { ...profile, avatar: newAvatar };
    setProfile(updated);
    storage.saveProfile(updated);
  };

  // Deposit Coins (Demo)
  const handleDepositCoins = (amount: number, description: string) => {
    const newBalance = coins + amount;
    handleCoinsChange(newBalance);

    const newTx = storage.addTransaction({
      type: 'DEMO_DEPOSIT',
      gameTitle: description,
      amount,
      balanceAfter: newBalance,
    });
    setTransactions((prev) => [newTx, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 flex flex-col font-sans cyber-grid-bg selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Futuristic Navbar */}
      <Navbar
        userCoins={coins}
        profile={profile}
        currentCategory={currentView}
        onSelectCategory={(cat) => {
          if (cat === 'all') setCurrentView('lobby');
          else if (cat === 'slots') setCurrentView('slot');
          else if (cat === 'fishing') setCurrentView('fishing');
          else if (cat === 'racer') setCurrentView('racer');
          else if (cat === 'crash') setCurrentView('crash');
          else if (cat === 'fusion') setCurrentView('fusion');
          else if (cat === 'avatar') setCurrentView('avatar');
          else if (cat === 'cinema') setCurrentView('cinema');
        }}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenVip={() => setVipOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenAvatar={() => setCurrentView('avatar')}
        onOpenFileVault={() => setFileVaultOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Subheader Back Navigation when in active game view */}
        {currentView !== 'lobby' && (
          <div className="w-full bg-slate-950/60 border-b border-cyan-500/20 py-3 px-4">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setCurrentView('lobby');
                }}
                className="flex items-center gap-2 text-xs font-cyber font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO LOBBY</span>
              </button>

              {/* Slot Theme Quick Switcher when in 3D Slot Mode */}
              {currentView === 'slot' && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="font-tech text-xs text-slate-400 font-bold mr-1 uppercase">
                    3D THEMES:
                  </span>
                  {(['dragon', 'space', 'egypt', 'gold', 'treasure', 'fantasy'] as SlotThemeId[]).map(
                    (themeKey) => {
                      const t = SLOT_THEMES[themeKey];
                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            sound.playUiClick();
                            setSelectedSlotTheme(themeKey);
                          }}
                          className={`px-3 py-1 rounded-lg font-cyber text-[11px] font-bold transition whitespace-nowrap ${
                            selectedSlotTheme === themeKey
                              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.symbols[0].icon} {t.name.split(' ')[0]}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Switching */}
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center">
          {currentView === 'lobby' && (
            <HomeDashboard
              userCoins={coins}
              profile={profile}
              dailyStatus={dailyStatus}
              onClaimDaily={handleClaimDaily}
              onLaunchSlot={(themeId) => {
                setSelectedSlotTheme(themeId);
                setCurrentView('slot');
              }}
              onLaunchFishing={() => setCurrentView('fishing')}
              onLaunchRacer={() => setCurrentView('racer')}
              onLaunchCrash={() => setCurrentView('crash')}
              onLaunchCinema={() => setCurrentView('cinema')}
              onLaunchFusion={() => setCurrentView('fusion')}
              onOpenAvatar={() => setCurrentView('avatar')}
              onOpenWallet={() => setWalletOpen(true)}
              onOpenVip={() => setVipOpen(true)}
              onOpenFileVault={() => setFileVaultOpen(true)}
            />
          )}

          {currentView === 'slot' && (
            <div className="w-full flex flex-col items-center">
              <SlotMachine3D
                theme={SLOT_THEMES[selectedSlotTheme]}
                userCoins={coins}
                onCoinsChange={handleCoinsChange}
                onRecordWin={handleRecordWin}
              />
            </div>
          )}

          {currentView === 'fishing' && (
            <div className="w-full flex flex-col items-center">
              <FishingGame3D
                userCoins={coins}
                onCoinsChange={handleCoinsChange}
                onCatchRecord={handleCatchRecord}
              />
            </div>
          )}

          {currentView === 'racer' && (
            <div className="w-full flex flex-col items-center">
              <CyberRacer3D
                userCoins={coins}
                onCoinsChange={handleCoinsChange}
                onRecordWin={handleRecordWin}
              />
            </div>
          )}

          {currentView === 'crash' && (
            <div className="w-full flex flex-col items-center">
              <CyberCrashRocket
                userCoins={coins}
                onCoinsChange={handleCoinsChange}
                onRecordWin={handleRecordWin}
              />
            </div>
          )}

          {currentView === 'fusion' && (
            <FusionGames
              userCoins={coins}
              onCoinsChange={handleCoinsChange}
              onRecordWin={handleRecordWin}
            />
          )}

          {currentView === 'avatar' && (
            <AvatarStudio3D profile={profile} onSaveAvatar={handleSaveAvatar} />
          )}

          {currentView === 'cinema' && (
            <CyberVideoPlayer />
          )}
        </div>
      </main>

      {/* Futuristic Global Footer */}
      <Footer />

      {/* Global Modals */}
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        userCoins={coins}
        vipPoints={profile.vipPoints}
        transactions={transactions}
        onDepositCoins={handleDepositCoins}
      />

      <VipRewardsModal
        isOpen={vipOpen}
        onClose={() => setVipOpen(false)}
        profile={profile}
        dailyStatus={dailyStatus}
        onClaimDaily={handleClaimDaily}
        onClaimAchievement={handleClaimAchievement}
      />

      <AdminDashboardModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        adminSettings={adminSettings}
        onSaveSettings={(s) => {
          setAdminSettings(s);
          storage.saveAdminSettings(s);
        }}
        profile={profile}
        userCoins={coins}
        onCoinsChange={handleCoinsChange}
        onUpdateProfile={(p) => {
          setProfile(p);
          storage.saveProfile(p);
        }}
      />

      <FileVaultModal
        isOpen={fileVaultOpen}
        onClose={() => setFileVaultOpen(false)}
        profile={profile}
        userCoins={coins}
        transactions={transactions}
      />
    </div>
  );
}
