import { IRewardRepository } from '../../repositories/IRewardRepository';
import { IRedemptionRepository } from '../../repositories/IRedemptionRepository';
import { IPointRepository } from '../../repositories/IPointRepository';
import { IUserRepository } from '../../repositories/IUserRepository';
import { Redemption } from '../../entities/Redemption';

export class RedeemRewardUseCase {
    constructor(
        private rewardRepository: IRewardRepository,
        private redemptionRepository: IRedemptionRepository,
        private pointRepository: IPointRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(userId: string, rewardId: string): Promise<Redemption> {
        // Get reward details
        const reward = await this.rewardRepository.getById(rewardId);
        if (!reward) {
            throw new Error('Ödül bulunamadı');
        }

        if (!reward.isAvailable) {
            throw new Error('Bu ödül şu anda mevcut değil');
        }

        // Check user has enough points
        const userPoints = await this.pointRepository.getUserTotal(userId);
        if (userPoints < reward.requiredPoints) {
            throw new Error('Yetersiz puan');
        }

        // Create redemption record
        const redemption = await this.redemptionRepository.create({
            userId,
            rewardId: reward.id,
            rewardName: reward.name,
            pointsSpent: reward.requiredPoints,
            timestamp: new Date(),
            status: 'completed',
        });

        // Deduct points
        await this.pointRepository.deductPoints(userId, reward.requiredPoints, redemption.id);

        // Update user's total points
        const newTotal = await this.pointRepository.getUserTotal(userId);
        await this.userRepository.updatePoints(userId, newTotal);

        return redemption;
    }
}
