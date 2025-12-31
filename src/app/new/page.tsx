"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Save, Unlock, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LANGUAGES = [
    "plaintext", "javascript", "typescript", "python", "html", "css", "json",
    "markdown", "sql", "bash", "go", "java", "cpp", "rust", "yaml"
].sort();

export default function NewPastePage() {
    const { user, credentials } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("plaintext");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!content.trim()) {
            setError("Content cannot be empty");
            return;
        }
        if (!user || !credentials) {
            setError("You must be logged in");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data, error: rpcError } = await supabase.rpc("api_create_paste", {
                p_username: credentials.username,
                p_hash: credentials.hash,
                p_content: content,
                p_language: language,
                p_title: title || null,
                p_description: null,
                p_is_public: isPublic,
            });

            if (rpcError) throw rpcError;

            if (data) {
                router.push(`/gist?id=${data}`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create paste");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">New Paste</h1>
            </div>

            <div className="grid gap-6 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                    <div className="space-y-4">
                        <div className="bg-card/50 border border-white/5 rounded-xl p-4">
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Untitled Snippet"
                                className="w-full bg-transparent text-lg font-medium placeholder:text-muted-foreground/30 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-card/50 border border-white/5 rounded-xl p-4 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-background/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Visibility</label>
                            <div className="flex rounded-md bg-background/50 p-1 border border-white/10">
                                <button
                                    onClick={() => setIsPublic(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded ${isPublic ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Unlock className="w-3 h-3" /> Public
                                </button>
                                <button
                                    onClick={() => setIsPublic(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded ${!isPublic ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Lock className="w-3 h-3" /> Private
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-[600px] border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d1117] relative">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                        <span className="ml-2 text-xs text-muted-foreground font-mono">editor</span>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="// Type or paste your code here..."
                        className="w-full h-full pt-12 p-4 font-mono text-sm bg-transparent text-gray-300 focus:outline-none resize-none leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {error ? (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-1.5 rounded-full">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    ) : <div />}

                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full hover:opacity-90 transition-all font-semibold shadow-lg shadow-white/5"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Paste
                    </button>
                </div>
            </div>
        </div>
    );
}
