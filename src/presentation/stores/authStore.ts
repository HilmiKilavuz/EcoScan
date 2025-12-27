import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { FirebaseAuthRepository } from '../../data/repositories/FirebaseAuthRepository';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';
import { LoginUseCase } from '../../domain/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/auth/RegisterUseCase';
import { LogoutUseCase } from '../../domain/usecases/auth/LogoutUseCase';
import { handleError } from '../../core/utils/errorHandler';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    clearError: () => void;
}

// Initialize repositories and use cases
const authRepository = new FirebaseAuthRepository();
const userRepository = new FirebaseUserRepository();
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository, userRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const user = await loginUseCase.execute(email, password);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
            throw error;
        }
    },

    register: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
            const user = await registerUseCase.execute(email, password, displayName);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await logoutUseCase.execute();
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            set({ error: handleError(error), isLoading: false });
            throw error;
        }
    },

    setUser: (user: User | null) => {
        set({ user, isAuthenticated: user !== null });
    },

    clearError: () => set({ error: null }),
}));

// Set up auth state listener
authRepository.onAuthStateChanged((user) => {
    useAuthStore.getState().setUser(user);
});
