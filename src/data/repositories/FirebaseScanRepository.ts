import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { IScanRepository } from '../../domain/repositories/IScanRepository';
import { Scan } from '../../domain/entities/Scan';
import { WasteType } from '../../core/constants/wasteTypes';

export class FirebaseScanRepository implements IScanRepository {
    async create(scan: Omit<Scan, 'id'>): Promise<Scan> {
        const docRef = await addDoc(collection(db, 'scans'), {
            ...scan,
            timestamp: serverTimestamp(),
        });

        return {
            ...scan,
            id: docRef.id,
        };
    }

    async getUserScans(userId: string, limitCount: number = 50): Promise<Scan[]> {
        const q = query(
            collection(db, 'scans'),
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
                wasteType: data.wasteType as WasteType,
                binColor: data.binColor,
                binName: data.binName,
                imageUrl: data.imageUrl,
                imageHash: data.imageHash,
                pointsEarned: data.pointsEarned,
                timestamp: data.timestamp?.toDate() || new Date(),
            };
        });
    }

    async checkDuplicateScan(
        userId: string,
        imageHash: string,
        withinHours: number
    ): Promise<boolean> {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - withinHours);

        const q = query(
            collection(db, 'scans'),
            where('userId', '==', userId),
            where('imageHash', '==', imageHash),
            where('timestamp', '>=', Timestamp.fromDate(cutoffTime))
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }
}
