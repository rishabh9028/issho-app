"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/layout/LoadingScreen";

export type Role = "guest" | "host" | "admin";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role | string;
    avatar: string;
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
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let profileSubscription: any = null;

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const derived = userFromSession(session);
                setUser(derived);
                setLoading(false);

                // Setup or cleanup profile subscription based on auth state
                if (derived) {
                    // Initial fetch
                    supabase
                        .from("profiles")
                        .select("role, full_name, avatar_url")
                        .eq("id", derived.id)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                setUser(prev => prev ? {
                                    ...prev,
                                    role: data.role || prev.role,
                                    name: data.full_name || prev.name,
                                    avatar: data.avatar_url || prev.avatar,
                                } : null);
                            }
                        });

                    // Real-time listener for profile changes
                    if (!profileSubscription) {
                        profileSubscription = supabase
                            .channel(`profile_sync_${derived.id}`)
                            .on(
                                'postgres_changes',
                                {
                                    event: 'UPDATE',
                                    schema: 'public',
                                    table: 'profiles',
                                    filter: `id=eq.${derived.id}`
                                },
                                (payload) => {
                                    const next = payload.new;
                                    setUser(prev => prev ? {
                                        ...prev,
                                        role: next.role || prev.role,
                                        name: next.full_name || prev.name,
                                        avatar: next.avatar_url || prev.avatar,
                                    } : null);
                                }
                            )
                            .subscribe();
                    }
                } else {
                    if (profileSubscription) {
                        supabase.removeChannel(profileSubscription);
                        profileSubscription = null;
                    }
                }
            }
        );

        const fallback = setTimeout(() => setLoading(false), 4000);

        return () => {
            clearTimeout(fallback);
            authSubscription?.unsubscribe();
            if (profileSubscription) {
                supabase.removeChannel(profileSubscription);
            }
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        const { signOut: serverSignOut } = await import("@/app/actions/auth");
        await serverSignOut();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {loading ? <LoadingScreen /> : children}
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
