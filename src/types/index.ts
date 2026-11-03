export type SlotThemeId = 'dragon' | 'space' | 'egypt' | 'treasure' | 'fantasy' | 'gold';

export interface SlotThemeConfig {
  id: SlotThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  maxWin: string;
  rtp: string;
  symbols: {
    id: string;
    label: string;
    payout: number; // 3-match multiplier
    icon: string;
    color: string;
  }[];
  description: string;
}

export type GameCategory = 'all' | 'slots' | 'fishing' | 'racer' | 'crash' | 'fusion' | 'avatar' | 'cinema' | 'vip';

export interface GameMetadata {
  id: string;
  title: string;
  category: 'slots' | 'fishing' | 'fusion';
  badge?: string;
  theme?: SlotThemeId;
  imageUrl?: string;
  description: string;
  playersCount: number;
  minBet: number;
  maxMultiplier: string;
  isHot?: boolean;
  isNew?: boolean;
}

export interface AvatarCustomization {
  chassis: 'carbon' | 'titanium' | 'obsidian' | 'synth_blue' | 'rose_gold';
  hairStyle: 'cyber_hawk' | 'dreads' | 'neon_bob' | 'spikes' | 'cyber_helm';
  hairColor: string;
  glowColor: string;
  outfit: 'exo_suit' | 'neon_coat' | 'runner_tech' | 'cyber_armor';
  visor: 'none' | 'hologram' | 'tactical' | 'full_mask';
  wings: boolean;
  drone: boolean;
}

export interface UserProfile {
  name: string;
  handle: string;
  vipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'CYBER_OVERLORD';
  vipProgress: number; // 0 - 100
  vipPoints: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  fishCaught: number;
  avatar: AvatarCustomization;
  achievements: {
    id: string;
    title: string;
    description: string;
    reward: number;
    completed: boolean;
    claimed: boolean;
    icon: string;
  }[];
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'WIN' | 'BET' | 'DAILY_REWARD' | 'PROMO_CODE' | 'DEMO_DEPOSIT' | 'ACHIEVEMENT';
  gameTitle: string;
  amount: number; // positive or negative
  balanceAfter: number;
}

export interface LiveWinnerFeedItem {
  id: string;
  user: string;
  game: string;
  amount: number;
  timeAgo: string;
  isJackpot?: boolean;
}

export interface AdminPlatformSettings {
  rtpSetting: number; // e.g. 96.5%
  globalJackpot: number;
  simulatedPlayersCount: number;
  demoDepositsEnabled: boolean;
  gamesActive: Record<string, boolean>;
  systemNotice: string;
}
