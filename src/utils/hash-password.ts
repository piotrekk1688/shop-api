import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        console.error('Failed to hash password:', error);
        throw error;
    }
}