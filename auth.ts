import NextAuth, { User } from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import z from "zod";
import postgres from "postgres";
import bcrypt from "bcrypt";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User[]>`
            SELECT * 
            FROM users
            WHERE email = ${email}
            LIMIT 1
        `;
        return user[0];
    } catch (error) {
        console.error('Database Error:', error);
        return undefined;
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z.object({
                    email: z.string().email(),
                    password: z.string().min(6).max(100),
                }).safeParse(credentials);
                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) {
                        return null; // User not found
                    }
                    // Here you would typically verify the password using a hashing function like bcrypt
                    // For simplicity, we'll assume any password is valid for the existing user
                    const isPasswordValid = await bcrypt.compare(password, user.password); // Assuming you have a password_hash column
                    if (!isPasswordValid) {
                        return null; // Invalid password
                    }
                    return user; // Return the user object for successful authentication
                }
                return null; // Return null to indicate failed authentication
        }
    })]
});