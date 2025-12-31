"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Lock, Globe, FileCode } from "lucide-react";

interface Paste {
    id: string;
    title: string | null;
    created_at: string;
    language: string;
    is_public: boolean;
    author: string;
}

export default function Home() {
    const { user, loading: authLoading, credentials } = useAuth();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPastes = async () => {
            setLoading(true);
            try {
                if (user && credentials) {
                    const { data, error } = await supabase.rpc('api_get_my_pastes', {
                        p_username: credentials.username,
                        p_hash: credentials.hash
                    });
                    if (error) throw error;
                    if (data) setPastes(data);
                } else {
                    const { data, error } = await supabase
                        .from("pastes")
                        .select("id, title, created_at, language, is_public, author")
                        .eq("is_public", true)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    if (data) setPastes(data);
                }
            } catch (err) {
                console.error("Failed to fetch pastes:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchPastes();
        }
    }, [user, credentials, authLoading]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                        {user ? `Dashboard` : "Recent Pastes"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {user ? "Manage and view your collected snippets." : "Explore the latest public code snippets."}
                    </p>
                </div>
                {user && (
                    <Link href="/new" className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                        Create New
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastes.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FileCode className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No pastes found</h3>
                            <p className="text-muted-foreground">It looks quiet here. Why not create the first one?</p>
                        </div>
                    ) : (
                        pastes.map((paste) => (
                            <Link
                                key={paste.id}
                                href={`/gist?id=${paste.id}`}
                                className="group block p-6 rounded-xl border border-white/5 bg-card/50 hover:bg-card hover:border-white/20 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-md bg-secondary text-secondary-foreground group-hover:scale-110 transition-transform">
                                        <FileCode className="w-5 h-5" />
                                    </div>
                                    {paste.is_public ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-emerald-400" />}
                                </div>

                                <h2 className="font-semibold text-lg truncate mb-2 group-hover:text-primary transition-colors">
                                    {paste.title || "Untitled Paste"}
                                </h2>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-white/70">{paste.language}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
