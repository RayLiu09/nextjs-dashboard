import { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized ({ auth, request: {nextUrl}}) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (!isLoggedIn) {
                    return false;
                }
                return true;
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl.origin));
            }

            return false;
        },
    },
    providers:[] // No providers needed since we're only using credentials for authentication
} satisfies NextAuthConfig