import {
    AuthError,
    createClient,
    SupabaseClient,
    User,
} from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class AuthUtils {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    /**
     * Sign up a new user
     */
    async signUp(
        first_name: string,
        last_name: string,
        email: string,
        password: string
    ): Promise<{ user: User | null; error: AuthError | null }> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: first_name,
                    last_name: last_name,
                },
            },
        });

        return {
            user: data?.user ?? null,
            error,
        };
    }

    /**
     * Sign in with email and password
     */
    async signIn(
        email: string,
        password: string
    ): Promise<{ user: User | null; error: AuthError | null }> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {
            user: data?.user ?? null,
            error,
        };
    }

    /**
     * Sign out the current user
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        const { error } = await this.supabase.auth.signOut();
        return { error };
    }

    /**
     * Get the current logged in user
     */
    async getCurrentUser(): Promise<{
        user: User | null;
        error: AuthError | null;
    }> {
        const { data, error } = await this.supabase.auth.getUser();
        return {
            user: data?.user ?? null,
            error,
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: {
        [key: string]: any;
    }): Promise<{ error: AuthError | null }> {
        const { error } = await this.supabase.auth.updateUser(updates);
        return { error };
    }

    /**
     * Reset password
     */
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);
        return { error };
    }

    /**
     * Change password (when user is logged in)
     */
    async changePassword(
        newPassword: string
    ): Promise<{ error: AuthError | null }> {
        const { error } = await this.supabase.auth.updateUser({
            password: newPassword,
        });
        return { error };
    }

    /**
     * Get session
     */
    getSession() {
        return this.supabase.auth.getSession();
    }

    /**
     * Subscribe to auth changes
     */
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return this.supabase.auth.onAuthStateChange(callback);
    }
}

// Export a singleton instance
export const authUtils = new AuthUtils();
