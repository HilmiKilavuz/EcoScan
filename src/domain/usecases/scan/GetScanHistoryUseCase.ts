import { IScanRepository } from '../../repositories/IScanRepository';
import { Scan } from '../../entities/Scan';

export class GetScanHistoryUseCase {
    constructor(private scanRepository: IScanRepository) { }

    async execute(userId: string, limit: number = 50): Promise<Scan[]> {
        return await this.scanRepository.getUserScans(userId, limit);
    }
}
