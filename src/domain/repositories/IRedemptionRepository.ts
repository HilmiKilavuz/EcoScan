import { Redemption } from '../entities/Redemption';

export interface IRedemptionRepository {
    create(redemption: Omit<Redemption, 'id'>): Promise<Redemption>;
    getUserRedemptions(userId: string, limit?: number): Promise<Redemption[]>;
}
