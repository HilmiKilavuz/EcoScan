import { IAuthRepository } from '../../repositories/IAuthRepository';
import { IUserRepository } from '../../repositories/IUserRepository';
import { User } from '../../entities/User';

export class RegisterUseCase {
    constructor(
        private authRepository: IAuthRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(email: string, password: string, displayName: string): Promise<User> {
        if (!email || !password || !displayName) {
            throw new Error('Tüm alanlar gereklidir');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Geçersiz email formatı');
        }

        if (password.length < 6) {
            throw new Error('Şifre en az 6 karakter olmalıdır');
        }

        if (displayName.trim().length < 2) {
            throw new Error('İsim en az 2 karakter olmalıdır');
        }

        return await this.authRepository.register(email, password, displayName);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
