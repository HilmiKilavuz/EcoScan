import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';

export class FirebaseAuthRepository implements IAuthRepository {
    async login(email: string, password: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return await this.getUserData(userCredential.user.uid);
    }

    async register(email: string, password: string, displayName: string): Promise<User> {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Create user document in Firestore
        const userData: User = {
            id: userId,
            email,
            displayName,
            totalPoints: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', userId), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return userData;
    }

    async logout(): Promise<void> {
        await signOut(auth);
    }

    async getCurrentUser(): Promise<User | null> {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;
        return await this.getUserData(currentUser.uid);
    }

    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const user = await this.getUserData(firebaseUser.uid);
                callback(user);
            } else {
                callback(null);
            }
        });
    }

    private async getUserData(userId: string): Promise<User> {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('Kullanıcı verisi bulunamadı');
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
}
