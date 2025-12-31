"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useDesktopStore } from "@/store/desktopStore";
import DesktopWindow from "@/components/desktop/DesktopWindow";
import Dock from "@/components/desktop/Dock";
import { FileCode, Globe, Loader2, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// Change Password Component to be rendered inside the "Settings" window
// We'll use a portal or just simple conditioning in the Window component, 
// but for now, let's keep it simple: The "Window" component can render React nodes if we updated the type,
// or we just inject HTML form markup for the 'settings' type using regular React in the Page.
// Actually, let's make the DesktopPage render a specific Overlay or just handle the Settings Window content separately.

interface Paste {
    id: string;
    title: string | null;
    content: string;
    language: string;
    is_public: boolean;
}

export default function DesktopPage() {
    const { user, credentials, logout } = useAuth();
    const { windows, openWindow } = useDesktopStore();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load Pastes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let data: Paste[] = [];
                if (user && credentials) {
                    const { data: rpcData } = await supabase.rpc('api_get_my_pastes', {
                        p_username: credentials.username,
                        p_hash: credentials.hash
                    });
                    if (rpcData) data = rpcData;
                } else {
                    const { data: publicData } = await supabase
                        .from("pastes")
                        .select("*")
                        .eq("is_public", true)
                        .order("created_at", { ascending: false })
                        .limit(50);
                    if (publicData) data = publicData;
                }
                setPastes(data);
            } catch (e) {
                console.error("Failed to load desktop files", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user, credentials]);

    // Handle Open File
    const handleOpenFile = (paste: Paste) => {
        const isHtml = paste.language.toLowerCase() === 'html';
        openWindow({
            id: paste.id,
            title: paste.title || 'Untitled',
            type: isHtml ? 'preview' : 'editor',
            content: paste.content,
            language: paste.language,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: 100
        });
    }

    // Handle Open Settings (Change Password)
    const handleOpenSettings = () => {
        openWindow({
            id: 'settings',
            title: 'System Settings',
            type: 'settings',
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: 200,
            size: { width: 400, height: 500 },
            content: `
            <div id="settings-root" class="h-full flex flex-col p-4">
                <h2 class="text-xl font-bold mb-4">Account</h2>
                <p class="text-sm text-gray-400 mb-4">Manage your credentials</p>
                <!-- We will mount a React component here if possible, or just use this ID to render -->
            </div>
         `
        });
    };

    return (
        <div className="h-screen w-screen overflow-hidden relative bg-[url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center font-sans">
            <div className="absolute inset-0 bg-black/20" />

            {/* Top Bar */}
            <div className="absolute top-0 w-full h-8 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 text-white text-sm z-[10000] border-b border-white/5">
                <div className="flex items-center gap-4 font-semibold">
                    <Link href="/" className="hover:text-white/80 transition-colors"><ArrowLeft className="w-4 h-4 inline mr-1" /> Exit Desktop</Link>
                    <span className="opacity-50">|</span>
                    <span className="cursor-default hover:text-white/80">Finder</span>
                    <span className="cursor-default hover:text-white/80">File</span>
                    <span className="cursor-default hover:text-white/80">View</span>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <button onClick={() => { logout(); router.push('/login'); }} className="hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Desktop Icons Grid */}
            <div className="absolute top-8 bottom-20 left-0 right-0 p-6 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] grid-rows-[repeat(auto-fill,minmax(110px,1fr))] gap-2 content-start justify-items-center overflow-auto z-0">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center mt-20">
                        <Loader2 className="animate-spin text-white w-8 h-8 opacity-50" />
                        <p className="text-white/50 text-sm mt-2">Loading files...</p>
                    </div>
                ) : (
                    pastes.map(paste => (
                        <button
                            key={paste.id}
                            onDoubleClick={() => handleOpenFile(paste)}
                            className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center w-[90px] h-[110px]"
                        >
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                                {paste.language === 'html' ? <Globe className="w-8 h-8 text-blue-400" /> : <FileCode className="w-8 h-8 text-yellow-400" />}
                            </div>
                            <span className="text-white text-xs font-medium drop-shadow-md line-clamp-2 leading-tight px-1 bg-black/40 rounded w-full">
                                {paste.title || "Untitled"}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {/* Windows Layer */}
            {Object.values(windows).map(win => {
                if (win.type === 'settings') {
                    // Special rendering for Settings Window to support React interactive form
                    return (
                        <SettingsWindowWrapper key={win.id} window={win} />
                    )
                }
                return <DesktopWindow key={win.id} window={win} />;
            })}

            {/* Dock */}
            <Dock onOpenSettings={handleOpenSettings} />

        </div>
    );
}

// Special wrapper for settings to include the form
import { Rnd } from "react-rnd";
import { X, Minus } from "lucide-react";
import ChangePasswordForm from "@/components/ChangePasswordForm";

function SettingsWindowWrapper({ window }: { window: any }) {
    const { closeWindow, minimizeWindow, updateWindowPosition } = useDesktopStore();
    if (window.isMinimized) return null;
    return (
        <Rnd
            default={{ x: 100, y: 100, width: 400, height: 500 }}
            position={window.position}
            onDragStop={(e, d) => updateWindowPosition(window.id, { x: d.x, y: d.y })}
            className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-[#1e1e1e] backdrop-blur-md z-[9999]"
            dragHandleClassName="window-drag-handle"
        >
            <div className="window-drag-handle h-10 bg-[#2d2d2d] border-b border-black/20 flex items-center justify-between px-4">
                <div className="flex gap-2">
                    <button onClick={() => closeWindow(window.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600" />
                    <button onClick={() => minimizeWindow(window.id)} className="w-3 h-3 rounded-full bg-yellow-500" />
                </div>
                <span className="text-xs font-medium text-gray-400">Settings</span>
                <div className="w-10" />
            </div>
            <div className="flex-1 p-6 text-white overflow-auto">
                <h2 className="text-xl font-bold mb-6">System Settings</h2>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-semibold mb-4 text-gray-300 border-b border-white/5 pb-2">Change Password</h3>
                    <ChangePasswordForm />
                </div>
            </div>
        </Rnd>
    )
}
