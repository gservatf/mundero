// Índice del sistema de recompensas
// Exporta todos los componentes y tipos relacionados

export { RewardsCenter } from './RewardsCenter';
export { RewardCard } from './RewardCard';
export { RedemptionHistory } from './RedemptionHistory';
export { UserRewardStatsComponent as UserRewardStats } from './UserRewardStats';
export { useRewards } from './useRewards';

export type {
    Reward,
    RewardRedemption,
    UserRewardStats as UserRewardStatsType,
    RewardCategory,
    RewardType,
    RedemptionStatus
} from './types';

export { REWARD_TEMPLATES } from './types';