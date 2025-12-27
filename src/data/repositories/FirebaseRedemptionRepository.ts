import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { IRedemptionRepository } from '../../domain/repositories/IRedemptionRepository';
import { Redemption } from '../../domain/entities/Redemption';

export class FirebaseRedemptionRepository implements IRedemptionRepository {
    async create(redemption: Omit<Redemption, 'id'>): Promise<Redemption> {
        const docRef = await addDoc(collection(db, 'redemptions'), {
            ...redemption,
            timestamp: serverTimestamp(),
        });

        return {
            ...redemption,
            id: docRef.id,
        };
    }

    async getUserRedemptions(userId: string, limitCount: number = 50): Promise<Redemption[]> {
        const q = query(
            collection(db, 'redemptions'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                rewardId: data.rewardId,
                rewardName: data.rewardName,
                pointsSpent: data.pointsSpent,
                timestamp: data.timestamp?.toDate() || new Date(),
                status: data.status || 'completed',
            };
        });
    }
}
