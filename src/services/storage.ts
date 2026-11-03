import { AdminPlatformSettings, AvatarCustomization, Transaction, UserProfile } from '../types';

const STORAGE_KEYS = {
  COINS: 'ffg_coins_v1',
  TRANSACTIONS: 'ffg_transactions_v1',
  PROFILE: 'ffg_profile_v1',
  ADMIN: 'ffg_admin_v1',
  DAILY_LAST_CLAIM: 'ffg_daily_claim_v1',
  DAILY_STREAK: 'ffg_daily_streak_v1',
};

const DEFAULT_AVATAR: AvatarCustomization = {
  chassis: 'carbon',
  hairStyle: 'cyber_hawk',
  hairColor: '#00f0ff',
  glowColor: '#00f0ff',
  outfit: 'exo_suit',
  visor: 'hologram',
  wings: false,
  drone: true,
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'CyberAce',
  handle: '@cyber_ace_88',
  vipTier: 'SILVER',
  vipProgress: 42,
  vipPoints: 1250,
  totalSpins: 148,
  totalWins: 64,
  biggestWin: 12500,
  fishCaught: 39,
  avatar: DEFAULT_AVATAR,
  achievements: [
    {
      id: 'first_spin',
      title: 'Initiate Fusion',
      description: 'Spin any 3D slot machine once',
      reward: 1000,
      completed: true,
      claimed: true,
      icon: '🎰',
    },
    {
      id: 'big_win',
      title: 'High Voltage',
      description: 'Score a single win exceeding 5,000 coins',
      reward: 5000,
      completed: true,
      claimed: true,
      icon: '⚡',
    },
    {
      id: 'fisherman',
      title: 'Deep Sea Harpooner',
      description: 'Capture 25 robotic fish in 3D fishing',
      reward: 3500,
      completed: true,
      claimed: false,
      icon: '🦈',
    },
    {
      id: 'jackpot_hunter',
      title: 'Quantum Overlord',
      description: 'Unlock VIP Gold rank or higher',
      reward: 10000,
      completed: false,
      claimed: false,
      icon: '👑',
    },
    {
      id: 'avatar_stylist',
      title: 'Cyberpunk Aesthetic',
      description: 'Customize and equip a full 3D avatar',
      reward: 2000,
      completed: false,
      claimed: false,
      icon: '🎨',
    },
  ],
};

const DEFAULT_ADMIN: AdminPlatformSettings = {
  rtpSetting: 96.8,
  globalJackpot: 1845920,
  simulatedPlayersCount: 14820,
  demoDepositsEnabled: true,
  gamesActive: {
    dragon: true,
    space: true,
    egypt: true,
    treasure: true,
    fantasy: true,
    gold: true,
    fishing_3d: true,
    cyber_roulette: true,
    neon_plinko: true,
    dragon_battle: true,
    treasure_matrix: true,
  },
  systemNotice: 'Welcome to FUTURE FUSION GAMES! Demo coin mode active. Play responsibly.',
};

export const storage = {
  getCoins(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COINS);
      if (stored !== null) return parseInt(stored, 10);
    } catch {
      // fallback
    }
    return 25000;
  },

  setCoins(coins: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
    } catch {
      // ignore
    }
  },

  getTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'tx_init_1',
        timestamp: Date.now() - 3600000 * 2,
        type: 'DEMO_DEPOSIT',
        gameTitle: 'Welcome Starter Bonus',
        amount: 20000,
        balanceAfter: 20000,
      },
      {
        id: 'tx_init_2',
        timestamp: Date.now() - 3600000,
        type: 'DAILY_REWARD',
        gameTitle: 'Daily Login Reward',
        amount: 5000,
        balanceAfter: 25000,
      },
    ];
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>) {
    const fullTx: Transaction = {
      ...tx,
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    try {
      const current = this.getTransactions();
      const updated = [fullTx, ...current].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return fullTx;
  },

  getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  getAdminSettings(): AdminPlatformSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN;
  },

  saveAdminSettings(settings: AdminPlatformSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },

  getDailyClaimStatus(): { canClaim: boolean; currentDay: number; nextReward: number } {
    try {
      const lastClaimStr = localStorage.getItem(STORAGE_KEYS.DAILY_LAST_CLAIM);
      const streakStr = localStorage.getItem(STORAGE_KEYS.DAILY_STREAK);
      const lastClaim = lastClaimStr ? parseInt(lastClaimStr, 10) : 0;
      let streak = streakStr ? parseInt(streakStr, 10) : 1;

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const hoursSince = (now - lastClaim) / (1000 * 60 * 60);

      // if claimed within 20 hours, can't claim yet
      const canClaim = hoursSince >= 20 || lastClaim === 0;

      // if more than 48 hours passed, streak resets
      if (hoursSince > 48 && lastClaim !== 0) {
        streak = 1;
      }

      const rewards = [2000, 3500, 5000, 7500, 10000, 15000, 25000];
      const dayIndex = ((streak - 1) % 7);
      const nextReward = rewards[dayIndex];

      return { canClaim, currentDay: dayIndex + 1, nextReward };
    } catch {
      return { canClaim: true, currentDay: 1, nextReward: 2000 };
    }
  },

  claimDailyReward(): { rewardAmount: number; newStreak: number } {
    const rewards = [2000, 3500, 5000, 7500, 10000, 15000, 25000];
    const streakStr = localStorage.getItem(STORAGE_KEYS.DAILY_STREAK);
    let streak = streakStr ? parseInt(streakStr, 10) : 1;
    const dayIndex = (streak - 1) % 7;
    const rewardAmount = rewards[dayIndex];

    streak = streak >= 7 ? 1 : streak + 1;
    localStorage.setItem(STORAGE_KEYS.DAILY_LAST_CLAIM, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.DAILY_STREAK, streak.toString());

    return { rewardAmount, newStreak: streak };
  },
};
