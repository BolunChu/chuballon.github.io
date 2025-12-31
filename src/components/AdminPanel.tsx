"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, Trash2, Key, Shield, RefreshCw, Plus, Loader2 } from "lucide-react";

interface AppUser {
    username: string;
    is_admin: boolean;
    created_at: string;
}

export default function AdminPanel() {
    const { user, credentials } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(false);

    // Actions state
    const [newUserOpen, setNewUserOpen] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [resetTarget, setResetTarget] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState("");

    const loadUsers = async () => {
        if (!credentials) return;
        setLoading(true);
        const { data, error } = await supabase.rpc('api_list_users', {
            p_username: credentials.username,
            p_hash: credentials.hash
        });
        if (data) setUsers(data);
        setLoading(false);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credentials) return;

        // Hash password
        const encoder = new TextEncoder();
        const data = encoder.encode(newPassword);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const { error } = await supabase.rpc('api_admin_create_user', {
            p_admin_user: credentials.username,
            p_admin_hash: credentials.hash,
            p_new_username: newUsername,
            p_new_password_hash: hashHex,
            p_is_admin: false
        });

        if (error) alert(error.message);
        else {
            setNewUserOpen(false);
            setNewUsername("");
            setNewPassword("");
            loadUsers();
        }
    }

    const handleDeleteUser = async (targetUser: string) => {
        if (!confirm(`Are you sure you want to delete ${targetUser}? This will delete all their pastes.`)) return;
        if (!credentials) return;

        const { error } = await supabase.rpc('api_admin_delete_user', {
            p_admin_user: credentials.username,
            p_admin_hash: credentials.hash,
            p_target_username: targetUser
        });

        if (error) alert(error.message);
        else loadUsers();
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credentials || !resetTarget) return;

        const encoder = new TextEncoder();
        const data = encoder.encode(resetPassword);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const { error } = await supabase.rpc('api_admin_reset_password', {
            p_admin_user: credentials.username,
            p_admin_hash: credentials.hash,
            p_target_username: resetTarget,
            p_new_hash: hashHex
        });

        if (error) alert(error.message);
        else {
            alert(`Password for ${resetTarget} reset successfully.`);
            setResetTarget(null);
            setResetPassword("");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300">User Management</h3>
                <button onClick={() => loadUsers()} className="p-1 hover:bg-white/10 rounded">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[200px] overflow-auto pr-2 custom-scrollbar">
                {users.map(u => (
                    <div key={u.username} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {u.is_admin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{u.username}</p>
                                <p className="text-[10px] text-gray-500">{new Date(u.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {!u.is_admin && (
                            <div className="flex items-center gap-1">
                                <button onClick={() => setResetTarget(u.username)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Reset Password">
                                    <Key className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteUser(u.username)} className="p-2 hover:bg-white/10 rounded text-red-400/70 hover:text-red-400" title="Delete User">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {u.is_admin && <span className="text-xs text-purple-500/50 italic px-2">Admin</span>}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-white/10">
                {/* Create User Toggle */}
                {!newUserOpen && !resetTarget && (
                    <button
                        onClick={() => setNewUserOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create New User
                    </button>
                )}

                {/* Create User Form */}
                {newUserOpen && (
                    <form onSubmit={handleCreateUser} className="bg-white/5 p-4 rounded border border-white/10 space-y-3">
                        <p className="text-xs font-bold uppercase text-gray-400">New User</p>
                        <input className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                        <input className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm" type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded">Create</button>
                            <button type="button" onClick={() => setNewUserOpen(false)} className="px-3 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded">Cancel</button>
                        </div>
                    </form>
                )}

                {/* Reset Password Form */}
                {resetTarget && (
                    <form onSubmit={handleResetPassword} className="bg-white/5 p-4 rounded border border-white/10 space-y-3 border-l-2 border-l-yellow-500">
                        <p className="text-xs font-bold uppercase text-gray-400">Reset Password: <span className="text-white">{resetTarget}</span></p>
                        <input className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm" type="password" placeholder="New Password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1.5 rounded">Reset</button>
                            <button type="button" onClick={() => { setResetTarget(null); setResetPassword("") }} className="px-3 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded">Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
