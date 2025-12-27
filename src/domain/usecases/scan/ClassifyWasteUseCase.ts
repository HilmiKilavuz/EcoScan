import { IAIClassificationService } from '../../services/IAIClassificationService';
import { IScanRepository } from '../../repositories/IScanRepository';
import { IPointRepository } from '../../repositories/IPointRepository';
import { IUserRepository } from '../../repositories/IUserRepository';
import { Scan } from '../../entities/Scan';
import { WASTE_TYPE_TO_BIN } from '../../../core/constants/wasteTypes';
import { POINTS_BY_WASTE_TYPE, DUPLICATE_SCAN_WINDOW_HOURS } from '../../../core/constants/points';

export interface ClassifyWasteResult {
    scan: Scan;
    isDuplicate: boolean;
}

export class ClassifyWasteUseCase {
    constructor(
        private aiService: IAIClassificationService,
        private scanRepository: IScanRepository,
        private pointRepository: IPointRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(userId: string, imageUri: string, imageHash: string): Promise<ClassifyWasteResult> {
        // Check for duplicate scan
        const isDuplicate = await this.scanRepository.checkDuplicateScan(
            userId,
            imageHash,
            DUPLICATE_SCAN_WINDOW_HOURS
        );

        // Classify the waste using AI
        const classificationResult = await this.aiService.classifyImage(imageUri);
        const binInfo = WASTE_TYPE_TO_BIN[classificationResult.wasteType];

        // Calculate points (0 if duplicate)
        const pointsEarned = isDuplicate ? 0 : POINTS_BY_WASTE_TYPE[classificationResult.wasteType];

        // Create scan record
        const scan = await this.scanRepository.create({
            userId,
            wasteType: classificationResult.wasteType,
            binColor: binInfo.color,
            binName: binInfo.name,
            imageUrl: imageUri,
            imageHash,
            pointsEarned,
            timestamp: new Date(),
        });

        // Award points if not duplicate
        if (!isDuplicate && pointsEarned > 0) {
            await this.pointRepository.addPoints(userId, pointsEarned, scan.id);

            // Update user's total points
            const currentTotal = await this.pointRepository.getUserTotal(userId);
            await this.userRepository.updatePoints(userId, currentTotal);
        }

        return {
            scan,
            isDuplicate,
        };
    }
}
