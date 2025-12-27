import { create } from 'zustand';
import { Reward } from '../../domain/entities/Reward';
import { Redemption } from '../../domain/entities/Redemption';
import { FirebaseRewardRepository } from '../../data/repositories/FirebaseRewardRepository';
import { FirebaseRedemptionRepository } from '../../data/repositories/FirebaseRedemptionRepository';
import { FirebasePointRepository } from '../../data/repositories/FirebasePointRepository';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';
import { GetAvailableRewardsUseCase } from '../../domain/usecases/rewards/GetAvailableRewardsUseCase';
import { RedeemRewardUseCase } from '../../domain/usecases/rewards/RedeemRewardUseCase';
import { handleError } from '../../core/utils/errorHandler';

interface RewardsState {
    rewards: Reward[];
    redemptions: Redemption[];
    isLoading: boolean;
    error: string | null;

    fetchRewards: () => Promise<void>;
    redeemReward: (userId: string, rewardId: string) => Promise<void>;
    clearError: () => void;
}

const rewardRepository = new FirebaseRewardRepository();
const redemptionRepository = new FirebaseRedemptionRepository();
const pointRepository = new FirebasePointRepository();
const userRepository = new FirebaseUserRepository();
const getAvailableRewardsUseCase = new GetAvailableRewardsUseCase(
    rewardRepository,
    pointRepository
);
const redeemRewardUseCase = new RedeemRewardUseCase(
    rewardRepository,
    redemptionRepository,
    pointRepository,
    userRepository
);

export const useRewardsStore = create<RewardsState>((set) => ({
    rewards: [],
    redemptions: [],
    isLoading: false,
    error: null,

    fetchRewards: async () => {
        set({ isLoading: true, error: null });
        try {
            const allRewards = await rewardRepository.getAll();
            set({ rewards: allRewards, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
        }
    },

    redeemReward: async (userId: string, rewardId: string) => {
        set({ isLoading: true, error: null });
        try {
            await redeemRewardUseCase.execute(userId, rewardId);
            set({ isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
