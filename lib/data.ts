import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Diagram {
    id?: string;
    name: string;
    code: string;
    created_at?: string;
    modified_at?: string;
    user_id: string;
}

export interface UserDB {
    id?: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    user_id: string;
    created_at?: string;
}

// Diagram operations
export const diagramOperations = {
    async create(diagram: Diagram) {
        const { data, error } = await supabase
            .from("diagrams")
            .insert(diagram)
            .select()
            .single();

        return { data, error };
    },

    async update(id: string, updates: Partial<Diagram>) {
        const { data, error } = await supabase
            .from("diagrams")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        return { data, error };
    },

    async delete(id: string) {
        const { error } = await supabase.from("diagrams").delete().eq("id", id);

        return { error };
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from("diagrams")
            .select()
            .eq("id", id)
            .single();

        return { data, error };
    },

    async getAllByUser(userId: string) {
        const { data, error } = await supabase
            .from("diagrams")
            .select()
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        return { data, error };
    },
};

// User operations
export const userOperations = {
    async create(userData: UserDB) {
        const { data, error } = await supabase
            .from("users-db")
            .insert(userData)
            .select()
            .single();

        return { data, error };
    },

    async update(userId: string, updates: Partial<UserDB>) {
        const { data, error } = await supabase
            .from("users-db")
            .update(updates)
            .eq("user_id", userId)
            .select()
            .single();

        return { data, error };
    },

    async getByUserId(userId: string) {
        const { data, error } = await supabase
            .from("users-db")
            .select()
            .eq("user_id", userId)
            .single();

        return { data, error };
    },

    async updateAvatar(userId: string, avatarUrl: string) {
        const { data, error } = await supabase
            .from("users-db")
            .update({ avatar_url: avatarUrl })
            .eq("user_id", userId)
            .select()
            .single();

        return { data, error };
    },
};
