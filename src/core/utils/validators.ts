export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
    return password.length >= 6;
}

export function isValidDisplayName(name: string): boolean {
    return name.trim().length >= 2;
}
