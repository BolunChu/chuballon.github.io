"use client";

import { useDesktopStore } from "@/store/desktopStore";
import { Code2, Globe, Folder, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface DockProps {
    onOpenSettings: () => void;
}

export default function Dock({ onOpenSettings }: DockProps) {
    const { windows, activeWindowId, nextZIndex, minimizeWindow, focusWindow } = useDesktopStore();
    const openWindowsList = Object.values(windows);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl px-4 py-3 flex items-end gap-3 shadow-2xl">

                {/* Static: Finder */}
                <DockIcon label="Finder" onClick={() => alert("File system browsing coming soon!")}>
                    <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-b from-blue-400 to-blue-600">
                        <Folder className="w-7 h-7" />
                    </div>
                </DockIcon>

                {/* Static: Settings */}
                <DockIcon label="Settings" onClick={onOpenSettings}>
                    <div className="bg-gray-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-b from-gray-400 to-gray-600">
                        <Settings className="w-7 h-7" />
                    </div>
                </DockIcon>

                <div className="w-[1px] h-10 bg-white/10 mx-1" />

                {/* Active Windows */}
                {openWindowsList.map((win) => (
                    <DockIcon
                        key={win.id}
                        label={win.title}
                        isActive={!win.isMinimized}
                        onClick={() => {
                            if (win.isMinimized) focusWindow(win.id);
                            else if (activeWindowId === win.id) minimizeWindow(win.id);
                            else focusWindow(win.id);
                        }}
                    >
                        <div className="bg-[#2d2d2d] w-12 h-12 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg relative overflow-hidden group">
                            {win.type === 'preview' ? <Globe className="w-6 h-6 text-blue-400" /> : <Code2 className="w-6 h-6 text-yellow-400" />}
                            {win.content && (
                                <div className="absolute inset-0 opacity-10 p-1 text-[4px] pointer-events-none break-all font-mono leading-none">
                                    {win.content.slice(0, 100)}
                                </div>
                            )}
                        </div>
                    </DockIcon>
                ))}

            </div>
        </div>
    );
}

function DockIcon({ children, label, isActive, onClick }: { children: React.ReactNode, label: string, isActive?: boolean, onClick: () => void }) {
    return (
        <div className="group relative flex flex-col items-center gap-1">
            <motion.button
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="relative"
            >
                {children}
                {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full box-shadow-glow" />}
            </motion.button>
            <span className="absolute -top-10 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm z-50">
                {label}
            </span>
        </div>
    )
}
