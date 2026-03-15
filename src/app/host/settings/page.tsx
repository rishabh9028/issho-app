"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";

export default function HostSettings() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [upgradingToGold, setUpgradingToGold] = useState(false);

    // Profile fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    // Security fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/become-a-host");
        }
        
        // Handle upgrade query param
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('upgrade') === 'gold') {
            setActiveTab('membership');
        }
    }, [user, router]);

    // Pre-fill form from profile in DB
    useEffect(() => {
        if (!user) return;
        const parts = user.name?.split(" ") || [];
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        
        supabase
            .from("profiles")
            .select("bio, avatar_url")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
                if (data?.bio) setBio(data.bio);
                if (data?.avatar_url) setAvatarUrl(data.avatar_url);
            });
    }, [user]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('spaces')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('spaces')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setProfileMsg({ type: "success", text: "Avatar updated successfully!" });
        } catch (error: any) {
            setProfileMsg({ type: "error", text: error.message });
        } finally {
            setUploadingAvatar(false);
        }
    };

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

    const handleUpgradeToGold = async () => {
        setUpgradingToGold(true);
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error } = await supabase
            .from("profiles")
            .update({ 
                is_gold_host: true, 
                gold_host_expires_at: expiresAt.toISOString() 
            })
            .eq("id", user.id);
        
        setUpgradingToGold(false);
        if (!error) {
            setProfileMsg({ type: "success", text: "Congratulations! You are now a Gold Host 🌟" });
            // Remove the query param
            window.history.replaceState({}, '', window.location.pathname);
            // Revalidate/Refresh data
            router.refresh();
        } else {
            setProfileMsg({ type: "error", text: error.message });
        }
    };

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen pb-24 md:pb-0">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="settings" />

                    <div className="flex-1">
                        <header className="mb-10 flex flex-col gap-2">
                            <h1 className="text-slate-900 text-4xl font-black tracking-tight">Host Settings</h1>
                            <p className="text-slate-500 text-lg font-medium">Manage your personal information, security, and hosting preferences.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Settings Tabs */}
                            <div className="w-full lg:w-64 shrink-0 space-y-2">
                                {[
                                    { id: "profile", label: "Public Profile", icon: "person" },
                                    { id: "security", label: "Security & Login", icon: "shield" },
                                    { id: "membership", label: "Membership", icon: "stars" },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? "bg-brand-gradient text-white shadow-xl shadow-blue-500/20" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? "filled-icon font-black" : "text-slate-400"}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Settings Content Card */}
                            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm transition-all duration-500">
                                
                                {activeTab === "profile" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        
                                        {profileMsg && (
                                            <div className={`px-5 py-3 rounded-2xl text-sm font-bold ${profileMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                                {profileMsg.text}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                                            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative group/avatar cursor-pointer">
                                                <img 
                                                    src={avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                                    className="w-full h-full object-cover transition-opacity group-hover/avatar:opacity-50" 
                                                    alt="Avatar" 
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    disabled={uploadingAvatar}
                                                />
                                                {uploadingAvatar && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
                                                <p className="text-sm font-bold text-slate-400">Click to change avatar</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] mb-3 block">First Name</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] mb-3 block">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Bio</label>
                                                <textarea
                                                    rows={4}
                                                    value={bio}
                                                    onChange={e => setBio(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all resize-none"
                                                    placeholder="Tell creators a little about yourself and your hosting style..."
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
                                                className="bg-brand-gradient text-white px-10 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                                            >
                                                {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "security" && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-1">Security & Login</h2>
                                            <p className="text-sm text-slate-400 font-medium">Update your password to keep your host account secure.</p>
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
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] mb-3 block">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min. 8 characters"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] mb-3 block">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter new password"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                                            <button
                                                onClick={handleUpdatePassword}
                                                disabled={savingPassword}
                                                className="bg-brand-gradient text-white px-10 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                                            >
                                                {savingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "membership" && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-1">Your Membership</h2>
                                            <p className="text-sm text-slate-400 font-medium">Manage your host tier and premium benefits.</p>
                                        </div>

                                        {user.is_gold_host ? (
                                            <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex flex-col md:flex-row items-center gap-8">
                                                <div className="h-24 w-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
                                                    <span className="material-symbols-outlined text-5xl filled-icon">stars</span>
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                        <h3 className="text-2xl font-black text-amber-900 leading-none">Gold Host Status</h3>
                                                        <span className="px-3 py-1 bg-amber-200/50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-amber-800 opacity-70 mb-4">
                                                        Your membership is active and expires on {user.gold_host_expires_at ? new Date(user.gold_host_expires_at).toLocaleDateString() : 'N/A'}.
                                                    </p>
                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-amber-500 text-lg">check_circle</span>
                                                            <span className="text-xs font-black text-amber-900">Priority Search</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-amber-500 text-lg">check_circle</span>
                                                            <span className="text-xs font-black text-amber-900">Gold Badge</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-amber-500 text-lg">check_circle</span>
                                                            <span className="text-xs font-black text-amber-900">2x Visibility</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center text-center gap-6">
                                                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                                                        <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Standard Host</h3>
                                                        <p className="text-slate-500 font-medium max-w-md">Upgrade to Gold to stand out and grow your hosting business faster.</p>
                                                    </div>
                                                </div>

                                                <div className="bg-brand-gradient rounded-[40px] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                                                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <span className="material-symbols-outlined text-amber-400 text-3xl font-black filled-icon">stars</span>
                                                                <h4 className="text-4xl font-black italic tracking-tighter">GOLD HOST</h4>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-sm">check</span></div>
                                                                    <p className="font-bold">Always show above Standard properties</p>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-sm">check</span></div>
                                                                    <p className="font-bold">Exclusive Gold Host verification badge</p>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-sm">check</span></div>
                                                                    <p className="font-bold">Advanced performance analytics</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center space-y-6">
                                                            <div>
                                                                <p className="text-amber-300 text-sm font-black uppercase tracking-widest mb-1">Premium Tier</p>
                                                                <div className="flex items-end justify-center gap-1">
                                                                    <span className="text-5xl font-black tracking-tight">₹200</span>
                                                                    <span className="text-white/60 font-black mb-1">/ Month</span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={handleUpgradeToGold}
                                                                disabled={upgradingToGold}
                                                                className="w-full py-4 bg-white text-[#2F2BFF] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {upgradingToGold && <div className="w-4 h-4 border-2 border-[#2F2BFF]/30 border-t-[#2F2BFF] rounded-full animate-spin" />}
                                                                Pay & Upgrade
                                                            </button>
                                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Secure Stripe Payment Simulation</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="mt-20 border-t border-slate-200 py-8 text-center px-4">
                <p className="text-slate-400 text-xs font-bold">© 2025 Isshō. All rights reserved.</p>
            </footer>
        </div>
    );
}
