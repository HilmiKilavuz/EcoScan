export enum PointTransactionType {
    SCAN_REWARD = 'SCAN_REWARD',
    REWARD_REDEMPTION = 'REWARD_REDEMPTION',
}

export interface Point {
    id: string;
    userId: string;
    amount: number;
    type: PointTransactionType;
    referenceId: string; // scanId or redemptionId
    timestamp: Date;
}
