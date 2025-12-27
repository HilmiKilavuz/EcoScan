export interface Redemption {
    id: string;
    userId: string;
    rewardId: string;
    rewardName: string;
    pointsSpent: number;
    timestamp: Date;
    status: 'pending' | 'completed' | 'cancelled';
}
