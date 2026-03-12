"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { User, Mail, Shield, CreditCard } from "lucide-react";

export default function GuestProfile() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.push("/auth/login");
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 form-container">
            <h1 className="text-3xl font-extrabold text-foreground mb-8">Profile Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Settings Nav */}
                <div className="space-y-2">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-zinc-100 dark:bg-zinc-800 rounded-xl font-medium text-primary-600">
                            <User className="w-5 h-5" /> Let's Personalize
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 transition">
                            <Shield className="w-5 h-5" /> Security
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 transition">
                            <CreditCard className="w-5 h-5" /> Payments
                        </button>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="md:col-span-2 space-y-8">
                    <div className="card-premium p-6">
                        <h2 className="text-xl font-bold mb-6">Personal Info</h2>

                        <div className="flex items-center gap-6 mb-8">
                            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-zinc-200" />
                            <Button variant="outline">Update Photo</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1 block">First Name</label>
                                    <input type="text" defaultValue={user.name.split(" ")[0]} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1 block">Last Name</label>
                                    <input type="text" defaultValue={user.name.split(" ")[1] || ""} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-foreground mb-1 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input type="email" defaultValue={user.email} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-foreground mb-1 block">Bio</label>
                                <textarea rows={4} defaultValue={user.bio} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition resize-none"></textarea>
                            </div>

                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
