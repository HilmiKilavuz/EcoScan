import { IAuthRepository } from '../../repositories/IAuthRepository';
import { User } from '../../entities/User';

export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(email: string, password: string): Promise<User> {
        if (!email || !password) {
            throw new Error('Email ve şifre gereklidir');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Geçersiz email formatı');
        }

        return await this.authRepository.login(email, password);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
