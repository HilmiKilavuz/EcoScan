import * as Crypto from 'expo-crypto';

export async function generateImageHash(imageUri: string): Promise<string> {
    try {
        // For production, you might want to hash the actual image data
        // For now, we'll use a combination of URI and timestamp
        const hashInput = `${imageUri}-${Date.now()}`;
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            hashInput
        );
        return hash;
    } catch (error) {
        console.error('Error generating image hash:', error);
        // Fallback to simple hash
        return `hash-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
}
