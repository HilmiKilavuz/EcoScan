import { IAIClassificationService, AIClassificationResult } from '../../domain/services/IAIClassificationService';
import { WasteType } from '../../core/constants/wasteTypes';

export class MockAIService implements IAIClassificationService {
    async classifyImage(imageUri: string): Promise<AIClassificationResult> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Randomly classify waste for demo purposes
        const wasteTypes = Object.values(WasteType);
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];

        return {
            wasteType: randomType,
            confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
        };
    }
}
