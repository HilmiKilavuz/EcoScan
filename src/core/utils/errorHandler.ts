export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public userMessage: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function handleError(error: unknown): string {
    if (error instanceof AppError) {
        return error.userMessage;
    }

    if (error instanceof Error) {
        // Firebase auth errors
        if (error.message.includes('auth/user-not-found')) {
            return 'Kullanıcı bulunamadı';
        }
        if (error.message.includes('auth/wrong-password')) {
            return 'Hatalı şifre';
        }
        if (error.message.includes('auth/email-already-in-use')) {
            return 'Bu email adresi zaten kullanımda';
        }
        if (error.message.includes('auth/weak-password')) {
            return 'Şifre çok zayıf';
        }
        if (error.message.includes('auth/invalid-email')) {
            return 'Geçersiz email adresi';
        }
        if (error.message.includes('auth/network-request-failed')) {
            return 'Ağ bağlantısı hatası';
        }

        // Return the error message if it's already in Turkish
        if (error.message.includes('gereklidir') ||
            error.message.includes('Geçersiz') ||
            error.message.includes('bulunamadı') ||
            error.message.includes('Yetersiz')) {
            return error.message;
        }

        return error.message;
    }

    return 'Beklenmeyen bir hata oluştu';
}
