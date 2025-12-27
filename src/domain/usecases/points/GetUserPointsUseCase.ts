import { IPointRepository } from '../../repositories/IPointRepository';
import { Point } from '../../entities/Point';

export class GetUserPointsUseCase {
    constructor(private pointRepository: IPointRepository) { }

    async execute(userId: string): Promise<{
        total: number;
        transactions: Point[];
    }> {
        const [total, transactions] = await Promise.all([
            this.pointRepository.getUserTotal(userId),
            this.pointRepository.getUserTransactions(userId, 20),
        ]);

        return { total, transactions };
    }
}
