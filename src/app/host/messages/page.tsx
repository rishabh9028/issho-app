"use client";

import MessagingPage from "@/app/messages/page";
import { Suspense } from "react";

export default function HostMessagesWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagingPage />
        </Suspense>
    );
}
