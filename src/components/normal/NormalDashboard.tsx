"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Lock, Globe, FileCode, FileText } from "lucide-react";
// Local type definition

// Re-define for now to avoid complexity, but ideally move to src/types
interface PasteType {
    id: string;
    title: string | null;
    created_at: string;
    language: string;
    is_public: boolean;
    author: string;
    mime_type?: string;
    storage_path?: string;
}

interface NormalDashboardProps {
    user: any;
    pastes: PasteType[];
    loading: boolean;
}

export default function NormalDashboard({ user, pastes, loading }: NormalDashboardProps) {
    const getFileIcon = (paste: PasteType) => {
        if (paste.mime_type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (paste.mime_type?.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />;
        if (paste.mime_type?.includes('sheet')) return <FileText className="w-5 h-5 text-green-500" />;
        if (paste.language === 'html') return <Globe className="w-5 h-5 text-blue-400" />;
        return <FileCode className="w-5 h-5 text-primary" />;
    }

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
                                        {getFileIcon(paste)}
                                    </div>
                                    {paste.is_public ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-emerald-400" />}
                                </div>

                                <h2 className="font-semibold text-lg truncate mb-2 group-hover:text-primary transition-colors">
                                    {paste.title || "Untitled Paste"}
                                </h2>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-foreground/70">{paste.language}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
