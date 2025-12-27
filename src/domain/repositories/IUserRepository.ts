import { User } from '../entities/User';

export interface IUserRepository {
    getById(userId: string): Promise<User | null>;
    update(userId: string, data: Partial<User>): Promise<void>;
    updatePoints(userId: string, points: number): Promise<void>;
}
