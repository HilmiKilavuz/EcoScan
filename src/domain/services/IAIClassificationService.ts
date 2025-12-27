import { WasteType } from '../../core/constants/wasteTypes';

export interface AIClassificationResult {
    wasteType: WasteType;
    confidence: number;
}

export interface IAIClassificationService {
    classifyImage(imageUri: string): Promise<AIClassificationResult>;
}
