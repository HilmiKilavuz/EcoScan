import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class FirebaseUserRepository implements IUserRepository {
    async getById(userId: string): Promise<User | null> {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            return null;
        }

        const data = userDoc.data();
        return {
            id: userId,
            email: data.email,
            displayName: data.displayName,
            totalPoints: data.totalPoints || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }

    async update(userId: string, data: Partial<User>): Promise<void> {
        await updateDoc(doc(db, 'users', userId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    }

    async updatePoints(userId: string, points: number): Promise<void> {
        await updateDoc(doc(db, 'users', userId), {
            totalPoints: points,
            updatedAt: serverTimestamp(),
        });
    }
}
