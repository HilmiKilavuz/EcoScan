import {
    collection,
    doc,
    getDoc,
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { IRewardRepository } from '../../domain/repositories/IRewardRepository';
import { Reward } from '../../domain/entities/Reward';

export class FirebaseRewardRepository implements IRewardRepository {
    async getAll(): Promise<Reward[]> {
        const q = query(
            collection(db, 'rewards'),
            orderBy('requiredPoints', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => this.mapToReward(doc.id, doc.data()));
    }

    async getById(rewardId: string): Promise<Reward | null> {
        const rewardDoc = await getDoc(doc(db, 'rewards', rewardId));

        if (!rewardDoc.exists()) {
            return null;
        }

        return this.mapToReward(rewardDoc.id, rewardDoc.data());
    }

    async getAvailable(): Promise<Reward[]> {
        const q = query(
            collection(db, 'rewards'),
            where('isAvailable', '==', true),
            orderBy('requiredPoints', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => this.mapToReward(doc.id, doc.data()));
    }

    private mapToReward(id: string, data: any): Reward {
        return {
            id,
            name: data.name,
            description: data.description,
            requiredPoints: data.requiredPoints,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable ?? true,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }
}
