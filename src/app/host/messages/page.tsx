"use client";

import MessagingPage from "@/app/messages/page";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HostMessagesWrapper() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/become-a-host");
        }
    }, [user, router]);

    if (!user || (user.role !== "host" && user.role !== "admin")) return null;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagingPage />
        </Suspense>
    );
}
