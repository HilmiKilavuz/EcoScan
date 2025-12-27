import { IRewardRepository } from '../../repositories/IRewardRepository';
import { IPointRepository } from '../../repositories/IPointRepository';
import { Reward } from '../../entities/Reward';

export class GetAvailableRewardsUseCase {
    constructor(
        private rewardRepository: IRewardRepository,
        private pointRepository: IPointRepository
    ) { }

    async execute(userId: string): Promise<{
        allRewards: Reward[];
        affordableRewards: Reward[];
        userPoints: number;
    }> {
        const [allRewards, userPoints] = await Promise.all([
            this.rewardRepository.getAvailable(),
            this.pointRepository.getUserTotal(userId),
        ]);

        const affordableRewards = allRewards.filter(
            reward => reward.requiredPoints <= userPoints
        );

        return {
            allRewards,
            affordableRewards,
            userPoints,
        };
    }
}
