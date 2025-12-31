"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

            const success = await login(username, hashHex);
            if (success) {
                router.push("/");
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <KeyRound className="w-8 h-8" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground text-center mb-6 text-sm">Enter your credentials to access your dashboard.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5 uppercase text-muted-foreground" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2.5 border border-white/10 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5 uppercase text-muted-foreground" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-white/10 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center font-medium shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
