"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, KeyRound, CheckCircle, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
    const { user, credentials } = useAuth();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!user || !credentials) return <div className="text-muted-foreground">Please log in to change password.</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // 1. Hash Old Password
            const encoder = new TextEncoder();
            const oldData = encoder.encode(oldPassword);
            const oldHashBuffer = await crypto.subtle.digest("SHA-256", oldData);
            const oldHashHex = Array.from(new Uint8Array(oldHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            // 2. Hash New Password
            const newData = encoder.encode(newPassword);
            const newHashBuffer = await crypto.subtle.digest("SHA-256", newData);
            const newHashHex = Array.from(new Uint8Array(newHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            // 3. Call RPC
            const { error } = await supabase.rpc('api_change_password', {
                p_username: user.username,
                p_old_hash: oldHashHex,
                p_new_hash: newHashHex
            });

            if (error) {
                console.error(error);
                // Check for specific error message
                if (error.message.includes('Invalid Old')) {
                    throw new Error("Old password is incorrect.");
                }
                throw error;
            }

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setOldPassword("");
            setNewPassword("");

            // Ideally, update local storage hash immediately or logout
            // For safety, let's logout or update context?
            // Updating context is hard without exposing a updateHash method.
            // Let's ask user to relogin.

        } catch (e: any) {
            console.error(e);
            setMessage({ type: 'error', text: e.message || "Failed to change password" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Old Password</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    required
                />
            </div>
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">New Password</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    required
                />
            </div>

            {message && (
                <div className={`text-xs p-2 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity flex justify-center"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </button>

            {message?.type === 'success' && (
                <p className="text-[10px] text-gray-400 text-center mt-2">
                    Note: You may need to log in again with your new password next time.
                </p>
            )}
        </form>
    );
}
