"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import usersData from "@/data/users.json";

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
    loginAs: (role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const loginAs = (role: Role) => {
        // Find the first dummy user matching the role to mock login
        const foundUser = usersData.find((u) => u.role === role);
        if (foundUser) {
            setUser(foundUser);
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginAs, logout }}>
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
