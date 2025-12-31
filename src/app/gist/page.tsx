"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CodeViewer from "@/components/CodeViewer";
import { Loader2, Trash2, Calendar, User, Globe, Lock, Copy, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Paste {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
    language: string;
    is_public: boolean;
    author: string;
}

function ViewPasteContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { user, credentials } = useAuth();
    const router = useRouter();

    const [paste, setPaste] = useState<Paste | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("No paste ID provided.");
            setLoading(false);
            return;
        }

        const fetchPaste = async () => {
            try {
                let data: Paste | null = null;

                if (user && credentials) {
                    const { data: rpcData, error: rpcError } = await supabase.rpc('api_get_paste', {
                        p_username: credentials.username,
                        p_hash: credentials.hash,
                        p_paste_id: id
                    }).single();

                    if (rpcData) data = rpcData as Paste;

                } else {
                    const { data: pubData, error: pubError } = await supabase
                        .from("pastes")
                        .select("*")
                        .eq("id", id)
                        .single();
                    if (pubData) data = pubData as Paste;
                }

                if (data) {
                    setPaste(data);
                } else {
                    setError("Paste not found or private.");
                }

            } catch (e: any) {
                console.error(e);
                setError("Failed to load paste.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaste();
    }, [id, user, credentials]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this paste?")) return;
        if (!credentials || !id) return;

        setDeleting(true);
        try {
            const { data, error } = await supabase.rpc("api_delete_paste", {
                p_username: credentials.username,
                p_hash: credentials.hash,
                p_paste_id: id
            });

            if (error) throw error;
            router.push("/");
        } catch (e) {
            console.error(e);
            alert("Error deleting paste.");
        } finally {
            setDeleting(false);
        }
    };

    const copyToClipboard = () => {
        if (!paste) return;
        navigator.clipboard.writeText(paste.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    if (error || !paste) return <div className="text-center py-40 text-muted-foreground">{error || "404 Not Found"}</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
                <div className="space-y-4">
                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded-full border ${paste.is_public ? 'bg-primary/10 text-primary border-primary/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} flex items-center gap-1`}>
                            {paste.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {paste.is_public ? "Public" : "Private"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground uppercase tracking-wider">
                            {paste.language}
                        </span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{paste.title || "Untitled Paste"}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <User className="w-4 h-4" /> {paste.author}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy Code"}
                    </button>

                    {user && user.username === paste.author && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20 transition-colors text-sm font-medium"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={copyToClipboard} className="p-2 bg-white/10 rounded-md hover:bg-white/20 text-white">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <CodeViewer code={paste.content} language={paste.language} />
            </div>
        </div>
    );
}

export default function ViewPastePage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}>
            <ViewPasteContent />
        </Suspense>
    )
}
