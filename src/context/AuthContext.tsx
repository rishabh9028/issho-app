"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export type Role = "guest" | "host" | "admin";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role | string;
    avatar: string;
    is_gold_host?: boolean;
    gold_host_expires_at?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extract user from session without a database round-trip
function userFromSession(session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null): User | null {
    if (!session?.user) return null;
    const meta = session.user.user_metadata || {};
    return {
        id: session.user.id,
        email: session.user.email || "",
        name: (meta.full_name as string) || (meta.name as string) || (session.user.email?.split("@")[0] ?? ""),
        role: (meta.role as string) || "guest",
        avatar: (meta.avatar_url as string) || "",
        is_gold_host: (meta.is_gold_host as boolean) || false,
        gold_host_expires_at: (meta.gold_host_expires_at as string) || undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const derived = userFromSession(session);
            setUser(derived);
            setLoading(false);

            if (derived) {
                fetchProfile(derived.id);
            }
        });

        async function fetchProfile(userId: string) {
            const { data, error } = await supabase
                .from("profiles")
                .select("role, full_name, avatar_url, is_gold_host, gold_host_expires_at")
                .eq("id", userId)
                .single();

            if (error) {
                console.warn("Could not fetch full profile details:", error.message);
                return;
            }

            if (data) {
                setUser(prev => prev ? {
                    ...prev,
                    role: data.role || prev.role,
                    name: data.full_name || prev.name,
                    avatar: data.avatar_url || prev.avatar,
                    is_gold_host: data.is_gold_host ?? prev.is_gold_host,
                    gold_host_expires_at: data.gold_host_expires_at || prev.gold_host_expires_at,
                } : null);
            }
        }

        // Listen for auth state changes (login/logout)
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const derived = userFromSession(session);
                setUser(derived);
                setLoading(false);

                if (derived) {
                    fetchProfile(derived.id);
                }
            }
        );

        return () => {
            authSubscription?.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        const { signOut: serverSignOut } = await import("@/actions/auth");
        await serverSignOut();
        setUser(null);
        window.location.href = '/';
    };

    const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
