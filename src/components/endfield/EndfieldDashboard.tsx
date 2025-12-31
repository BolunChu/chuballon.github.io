"use client";

import Link from "next/link";
import { FileText, Globe, FileCode, Activity, Radio, Cpu } from "lucide-react";
import { EndfieldCard, EndfieldButton } from "@/components/EndfieldUI";

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

interface EndfieldDashboardProps {
    user: any;
    pastes: PasteType[];
    loading: boolean;
}

export default function EndfieldDashboard({ user, pastes, loading }: EndfieldDashboardProps) {

    const getFileIcon = (paste: PasteType) => {
        if (paste.mime_type?.includes('pdf')) return <FileText className="w-5 h-5" />;
        if (paste.mime_type?.includes('word')) return <FileText className="w-5 h-5" />;
        if (paste.language === 'html') return <Globe className="w-5 h-5" />;
        return <FileCode className="w-5 h-5" />;
    }

    return (
        <div className="container mx-auto px-4 py-8 relative">
            {/* Hexagonal Grid Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 -z-10 opacity-20 pointer-events-none stroke-[#FFE600] fill-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <path d="M10 10 L30 10 L40 27 L30 44 L10 44 L0 27 Z" strokeWidth="0.5" />
                    <path d="M45 10 L65 10 L75 27 L65 44 L45 44 L35 27 Z" strokeWidth="0.5" />
                    <path d="M80 10 L100 10 L110 27 L100 44 L80 44 L70 27 Z" strokeWidth="0.5" />
                    {/* Grid Pattern */}
                </svg>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="relative">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-[#FFE600] uppercase font-mono tracking-widest">
                        {user ? `Dashboard` : "Recent Pastes"}
                    </h1>
                    <p className="text-lg text-gray-400 font-mono text-sm uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#FFE600]" />
                        SYSTEM_STATUS: ONLINE // {user ? "AUTH_VERIFIED" : "GUEST_ACCESS"}
                    </p>
                    {/* Decorative Data Line */}
                    <div className="h-[1px] w-full bg-[#FFE600]/30 mt-2 flex items-center">
                        <div className="w-10 h-[2px] bg-[#FFE600]" />
                    </div>
                </div>
                {user && (
                    <div className="bg-[#FFE600]/10 p-1 border border-[#FFE600]/30 backdrop-blur-sm">
                        <Link href="/new" className="block">
                            <EndfieldButton className="w-full h-full text-sm">
                                <Cpu className="w-4 h-4 inline-block mr-2" />
                                INIT_NEW_PASTE
                            </EndfieldButton>
                        </Link>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 border border-[#FFE600]/20 bg-[#FFE600]/5 animate-pulse relative overflow-hidden"
                            style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}>
                            {/* Scanning Effect */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#FFE600]/50 animate-[scan_2s_linear_infinite]" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastes.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#FFE600]/20 p-8">
                            <div className="w-16 h-16 bg-[#FFE600]/5 rounded-none flex items-center justify-center mb-4 border border-[#FFE600]/50">
                                <Radio className="w-8 h-8 text-[#FFE600] animate-pulse" />
                            </div>
                            <h3 className="text-xl font-mono text-[#FFE600] mb-2 uppercase">No Data Found</h3>
                            <p className="text-gray-500 font-mono text-xs">Waiting for input stream...</p>
                        </div>
                    ) : (
                        pastes.map((paste) => (
                            <Link key={paste.id} href={`/gist?id=${paste.id}`} className="block">
                                <EndfieldCard className="h-full group hover:bg-[#FFE600]/5 hover:shadow-[0_0_20px_rgba(255,230,0,0.1)] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[#FFE600] p-1 border border-[#FFE600]/20 bg-black/50">
                                            {getFileIcon(paste)}
                                        </div>
                                        <div className="text-[10px] font-mono text-[#FFE600] border border-[#FFE600]/30 px-1 py-0.5 bg-[#FFE600]/10">
                                            {paste.is_public ? 'PUB' : 'PVT'} :: {paste.mime_type ? 'FILE' : 'TXT'}
                                        </div>
                                    </div>
                                    <h2 className="font-mono text-lg font-bold text-white mb-2 group-hover:text-[#FFE600] truncate uppercase tracking-tight">
                                        {paste.title || "UNTITLED_DATA"}
                                    </h2>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase mt-4">
                                        <span>T: {new Date(paste.created_at).toISOString().split('T')[0]}</span>
                                        <span className="border-l border-gray-600 pl-2 text-[#FFE600]">{paste.language.toUpperCase()}</span>
                                    </div>

                                    {/* Scanning Line on Hover */}
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FFE600] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                </EndfieldCard>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
