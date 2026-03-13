"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";

export default function GuestSettings() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Security fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (!user) router.push("/auth/login");
    }, [user, router]);

    // Pre-fill form from profile in DB
    useEffect(() => {
        if (!user) return;
        const parts = user.name?.split(" ") || [];
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        supabase
            .from("profiles")
            .select("bio")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
                if (data?.bio) setBio(data.bio);
            });
    }, [user]);

    if (!user) return null;


    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileMsg(null);
        const fullName = `${firstName} ${lastName}`.trim();
        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        setSavingProfile(false);
        if (error) setProfileMsg({ type: "error", text: error.message });
        else setProfileMsg({ type: "success", text: "Profile saved successfully!" });
    };

    // --- Update Password ---
    const handleUpdatePassword = async () => {
        if (!currentPassword) return setPasswordMsg({ type: "error", text: "Please enter your current password." });
        if (newPassword.length < 8) return setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
        if (newPassword !== confirmPassword) return setPasswordMsg({ type: "error", text: "Passwords don't match." });

        setSavingPassword(true);
        setPasswordMsg(null);

        // Re-authenticate with current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            setSavingPassword(false);
            return setPasswordMsg({ type: "error", text: "Current password is incorrect." });
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setSavingPassword(false);

        if (error) setPasswordMsg({ type: "error", text: error.message });
        else {
            setPasswordMsg({ type: "success", text: "Password updated successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="settings" />

                    <div className="flex-1">
                        <header className="mb-10 flex flex-col gap-2">
                            <h1 className="text-slate-900 text-4xl font-black tracking-tight">Account Settings</h1>
                            <p className="text-slate-500 text-lg font-medium">Manage your personal details and login security preferences.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Tabs */}
                            <div className="w-full lg:w-64 shrink-0 space-y-2">
                                {[
                                    { id: "profile", label: "Personal Info", icon: "person" },
                                    { id: "security", label: "Login & Security", icon: "shield" },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? "bg-[#1d1aff] text-white shadow-xl shadow-blue-500/20" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? "filled-icon font-black" : "text-slate-400"}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">

                                {/* Personal Info Tab */}
                                {activeTab === "profile" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

                                        {profileMsg && (
                                            <div className={`px-5 py-3 rounded-2xl text-sm font-bold ${profileMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                                {profileMsg.text}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                                            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative group/avatar">
                                                <img 
                                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Avatar" 
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
                                                <p className="text-sm font-bold text-slate-400">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] mb-3 block">First Name</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] mb-3 block">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Bio</label>
                                                <textarea
                                                    rows={4}
                                                    value={bio}
                                                    onChange={e => setBio(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all resize-none"
                                                    placeholder="Tell hosts a little about yourself..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    const parts = user.name?.split(" ") || [];
                                                    setFirstName(parts[0] || "");
                                                    setLastName(parts.slice(1).join(" ") || "");
                                                    setProfileMsg(null);
                                                }}
                                                className="text-slate-400 font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-all"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={savingProfile}
                                                className="bg-[#1d1aff] text-white px-10 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                                            >
                                                {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Login & Security Tab */}
                                {activeTab === "security" && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-1">Change Password</h2>
                                            <p className="text-sm text-slate-400 font-medium">Update your password to keep your account secure.</p>
                                        </div>

                                        {passwordMsg && (
                                            <div className={`px-5 py-3 rounded-2xl text-sm font-bold ${passwordMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                                {passwordMsg.text}
                                            </div>
                                        )}

                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={e => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] mb-3 block">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min. 8 characters"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] mb-3 block">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter new password"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                                            <button
                                                onClick={handleUpdatePassword}
                                                disabled={savingPassword}
                                                className="bg-[#1d1aff] text-white px-10 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                                            >
                                                {savingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                Update Password
                                            </button>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="mt-10 pt-8 border-t border-slate-100">
                                            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
                                            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-black text-slate-900">Delete Account</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">Permanently delete your account and all data. This cannot be undone.</p>
                                                </div>
                                                <button className="shrink-0 text-xs font-black text-red-500 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-all">
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
