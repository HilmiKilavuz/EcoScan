import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    sum,
    getAggregateFromServer,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { IPointRepository } from '../../domain/repositories/IPointRepository';
import { Point, PointTransactionType } from '../../domain/entities/Point';

export class FirebasePointRepository implements IPointRepository {
    async addPoints(userId: string, amount: number, referenceId: string): Promise<Point> {
        const docRef = await addDoc(collection(db, 'points'), {
            userId,
            amount,
            type: PointTransactionType.SCAN_REWARD,
            referenceId,
            timestamp: serverTimestamp(),
        });

        return {
            id: docRef.id,
            userId,
            amount,
            type: PointTransactionType.SCAN_REWARD,
            referenceId,
            timestamp: new Date(),
        };
    }

    async deductPoints(userId: string, amount: number, referenceId: string): Promise<Point> {
        const docRef = await addDoc(collection(db, 'points'), {
            userId,
            amount: -amount,
            type: PointTransactionType.REWARD_REDEMPTION,
            referenceId,
            timestamp: serverTimestamp(),
        });

        return {
            id: docRef.id,
            userId,
            amount: -amount,
            type: PointTransactionType.REWARD_REDEMPTION,
            referenceId,
            timestamp: new Date(),
        };
    }

    async getUserTotal(userId: string): Promise<number> {
        const q = query(
            collection(db, 'points'),
            where('userId', '==', userId)
        );

        try {
            const snapshot = await getAggregateFromServer(q, {
                totalPoints: sum('amount'),
            });
            return snapshot.data().totalPoints || 0;
        } catch (error) {
            // Fallback: manually sum if aggregation fails
            const querySnapshot = await getDocs(q);
            let total = 0;
            querySnapshot.forEach(doc => {
                total += doc.data().amount || 0;
            });
            return total;
        }
    }

    async getUserTransactions(userId: string, limitCount: number = 20): Promise<Point[]> {
        const q = query(
            collection(db, 'points'),
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
                amount: data.amount,
                type: data.type as PointTransactionType,
                referenceId: data.referenceId,
                timestamp: data.timestamp?.toDate() || new Date(),
            };
        });
    }
}
