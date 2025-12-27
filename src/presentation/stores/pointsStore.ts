import { create } from 'zustand';
import { Point } from '../../domain/entities/Point';
import { FirebasePointRepository } from '../../data/repositories/FirebasePointRepository';
import { GetUserPointsUseCase } from '../../domain/usecases/points/GetUserPointsUseCase';
import { handleError } from '../../core/utils/errorHandler';

interface PointsState {
    totalPoints: number;
    transactions: Point[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadUserPoints: (userId: string) => Promise<void>;
    refreshPoints: (userId: string) => Promise<void>;
    clearError: () => void;
}

// Initialize repository and use case
const pointRepository = new FirebasePointRepository();
const getUserPointsUseCase = new GetUserPointsUseCase(pointRepository);

export const usePointsStore = create<PointsState>((set) => ({
    totalPoints: 0,
    transactions: [],
    isLoading: false,
    error: null,

    loadUserPoints: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { total, transactions } = await getUserPointsUseCase.execute(userId);
            set({ totalPoints: total, transactions, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
        }
    },

    refreshPoints: async (userId: string) => {
        try {
            const { total, transactions } = await getUserPointsUseCase.execute(userId);
            set({ totalPoints: total, transactions });
        } catch (error) {
            console.error('Error refreshing points:', error);
        }
    },

    clearError: () => set({ error: null }),
}));
