export interface Reward {
    id: string;
    name: string;
    description: string;
    requiredPoints: number;
    imageUrl: string;
    isAvailable: boolean;
    createdAt: Date;
}
