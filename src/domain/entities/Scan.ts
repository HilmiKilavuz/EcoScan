import { WasteType } from '../../core/constants/wasteTypes';

export interface Scan {
    id: string;
    userId: string;
    wasteType: WasteType;
    binColor: string;
    binName: string;
    imageUrl: string;
    imageHash: string;
    pointsEarned: number;
    timestamp: Date;
}
