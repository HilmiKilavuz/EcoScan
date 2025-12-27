import { Scan } from '../entities/Scan';

export interface IScanRepository {
    create(scan: Omit<Scan, 'id'>): Promise<Scan>;
    getUserScans(userId: string, limit?: number): Promise<Scan[]>;
    checkDuplicateScan(userId: string, imageHash: string, withinHours: number): Promise<boolean>;
}
