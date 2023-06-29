import bcrypt from 'bcrypt';

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Failed to compare passwords:', error);
        throw error;
    }
}