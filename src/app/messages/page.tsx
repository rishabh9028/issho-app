"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import HostSidebar from "@/components/host/HostSidebar";

const MOCK_CHATS = [
    {
        id: "1",
        name: "Yuki Tanaka",
        lastMessage: "Is the studio available for a photoshoot this Sunday?",
        time: "10:24 AM",
        unread: true,
        avatar: "https://i.pravatar.cc/150?u=yuki",
        status: "Online"
    },
    {
        id: "2",
        name: "Kenji Sato",
        lastMessage: "Thanks for the great stay! Everything was perfect.",
        time: "Yesterday",
        unread: false,
        avatar: "https://i.pravatar.cc/150?u=kenji",
        status: "Offline"
    },
    {
        id: "3",
        name: "Ami Yamamoto",
        lastMessage: "Could you tell me more about the lighting in the Zen Garden?",
        time: "2 days ago",
        unread: false,
        avatar: "https://i.pravatar.cc/150?u=ami",
        status: "Online"
    }
];

const MOCK_MESSAGES = [
    { id: 1, sender: "them", text: "Hi there! I'm interested in booking your Modern Zen Studio for a half-day session.", time: "10:15 AM" },
    { id: 2, sender: "me", text: "Hello! That sounds great. What kind of session are you planning?", time: "10:18 AM" },
    { id: 3, sender: "them", text: "It's for a minimalist product photoshoot. We'll need about 4 hours.", time: "10:20 AM" },
    { id: 4, sender: "me", text: "Perfect. Does this Sunday work for you?", time: "10:22 AM" },
    { id: 5, sender: "them", text: "Is the studio available for a photoshoot this Sunday?", time: "10:24 AM" },
];

import { Suspense } from "react";

function MessagingContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
    const isHostView = searchParams.get("role") === "host" || (user?.role === "host" && !searchParams.get("role"));

    useEffect(() => {
        if (!user) router.push("/auth/login");
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row h-[calc(100vh-160px)]">
                    {isHostView ? (
                        <HostSidebar user={user} currentPage="messages" />
                    ) : (
                        <GuestSidebar user={user} currentPage="messages" />
                    )}

                    <div className="flex-1 flex gap-6 h-full">
                        {/* Chat List */}
                        <div className="w-full md:w-80 bg-white rounded-[32px] border border-slate-100 flex flex-col shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h1 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Messages</h1>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#1d1aff] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {MOCK_CHATS.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeChat.id === chat.id ? "bg-[#1d1aff]/5 border border-[#1d1aff]/10 shadow-sm" : "hover:bg-slate-50 border border-transparent"}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                                                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                                            </div>
                                            {chat.status === "Online" && (
                                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-sm font-black text-slate-900 truncate">{chat.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{chat.time}</p>
                                            </div>
                                            <p className={`text-xs truncate ${chat.unread ? "font-black text-slate-900" : "font-medium text-slate-500"}`}>{chat.lastMessage}</p>
                                        </div>
                                        {chat.unread && (
                                            <div className="h-2 w-2 bg-[#1d1aff] rounded-full shadow-[0_0_8px_rgba(29,26,255,0.4)]"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="hidden lg:flex flex-1 bg-white rounded-[32px] border border-slate-100 flex-col shadow-sm overflow-hidden relative">
                            {/* Chat Header */}
                            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100">
                                        <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 leading-tight">{activeChat.name}</p>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{activeChat.status}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1d1aff] transition-all"><span className="material-symbols-outlined text-lg">call</span></button>
                                    <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {MOCK_MESSAGES.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] group`}>
                                            <div className={`px-6 py-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${msg.sender === "me"
                                                    ? "bg-[#1d1aff] text-white rounded-tr-none hover:shadow-lg hover:shadow-blue-500/10"
                                                    : "bg-slate-100 text-slate-700 rounded-tl-none hover:bg-slate-200"
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] font-bold text-slate-400 mt-2 ${msg.sender === "me" ? "text-right" : "text-left"}`}>{msg.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 border-t border-slate-50 bg-white">
                                <div className="flex items-end gap-4 bg-slate-50 rounded-[28px] p-2 border border-slate-100 focus-within:border-[#1d1aff] focus-within:ring-4 focus-within:ring-[#1d1aff]/5 transition-all">
                                    <button className="h-12 w-12 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shrink-0"><span className="material-symbols-outlined">add</span></button>
                                    <textarea
                                        rows={1}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 resize-none"
                                    ></textarea>
                                    <button className="h-12 w-12 rounded-full bg-[#1d1aff] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all shrink-0">
                                        <span className="material-symbols-outlined filled-icon text-lg">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function MessagingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center"><p className="text-slate-400 font-bold">Loading messages...</p></div>}>
            <MessagingContent />
        </Suspense>
    );
}
