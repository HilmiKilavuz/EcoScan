import { Reward } from '../entities/Reward';

export interface IRewardRepository {
    getAll(): Promise<Reward[]>;
    getById(rewardId: string): Promise<Reward | null>;
    getAvailable(): Promise<Reward[]>;
}
