import { create } from 'zustand';
import { Scan } from '../../domain/entities/Scan';
import { FirebaseScanRepository } from '../../data/repositories/FirebaseScanRepository';
import { FirebasePointRepository } from '../../data/repositories/FirebasePointRepository';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';
import { MockAIService } from '../../data/services/MockAIService';
import { ClassifyWasteUseCase } from '../../domain/usecases/scan/ClassifyWasteUseCase';
import { GetScanHistoryUseCase } from '../../domain/usecases/scan/GetScanHistoryUseCase';
import { generateImageHash } from '../../core/utils/imageHash';
import { handleError } from '../../core/utils/errorHandler';

interface ScanState {
    currentScan: { scan: Scan; isDuplicate: boolean } | null;
    scans: Scan[];
    isLoading: boolean;
    error: string | null;

    classifyWaste: (userId: string, imageUri: string) => Promise<void>;
    fetchScans: (userId: string) => Promise<void>;
    clearCurrentScan: () => void;
    clearError: () => void;
}

const scanRepository = new FirebaseScanRepository();
const pointRepository = new FirebasePointRepository();
const userRepository = new FirebaseUserRepository();
const aiService = new MockAIService();
const classifyWasteUseCase = new ClassifyWasteUseCase(
    aiService,
    scanRepository,
    pointRepository,
    userRepository
);
const getScanHistoryUseCase = new GetScanHistoryUseCase(scanRepository);

export const useScanStore = create<ScanState>((set) => ({
    currentScan: null,
    scans: [],
    isLoading: false,
    error: null,

    classifyWaste: async (userId: string, imageUri: string) => {
        set({ isLoading: true, error: null });
        try {
            const imageHash = await generateImageHash(imageUri);
            const result = await classifyWasteUseCase.execute(userId, imageUri, imageHash);
            set({ currentScan: result, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
            throw error;
        }
    },

    fetchScans: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const scans = await getScanHistoryUseCase.execute(userId);
            set({ scans, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
        }
    },

    clearCurrentScan: () => set({ currentScan: null }),
    clearError: () => set({ error: null }),
}));
