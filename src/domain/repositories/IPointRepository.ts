import { Point } from '../entities/Point';

export interface IPointRepository {
    addPoints(userId: string, amount: number, referenceId: string): Promise<Point>;
    deductPoints(userId: string, amount: number, referenceId: string): Promise<Point>;
    getUserTotal(userId: string): Promise<number>;
    getUserTransactions(userId: string, limit?: number): Promise<Point[]>;
}
