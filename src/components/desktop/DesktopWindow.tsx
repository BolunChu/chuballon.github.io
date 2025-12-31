"use client";

import { Rnd } from "react-rnd";
import { useDesktopStore, WindowState } from "@/store/desktopStore";
import { X, Minus, Square, Maximize2 } from "lucide-react";
import CodeViewer from "./../CodeViewer";
import { supabase } from "@/lib/supabase";

interface DesktopWindowProps {
  window: WindowState;
}

export default function DesktopWindow({ window }: DesktopWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize } = useDesktopStore();

  if (window.isMinimized) return null;

  // Determine content to render
  const renderContent = () => {
    if (window.type === 'settings') {
      // Injected HTML content for simple settings, or we could use component mapping
      return <div className="p-6 text-white" dangerouslySetInnerHTML={{ __html: window.content || '' }} />;
    }

    if (window.type === 'preview' && window.language === 'html') {
      return <iframe srcDoc={window.content} className="w-full h-full bg-white border-0" sandbox="allow-scripts" />;
    }

    if (window.type === 'doc-viewer' && window.storagePath) {
      // Get Public URL
      const { data } = supabase.storage.from('uploads').getPublicUrl(window.storagePath);
      const publicUrl = data.publicUrl;

      if (window.mimeType === 'application/pdf') {
        // Use Google Docs viewer fallback or native embed? Native embed is better for PDF usually.
        // Or generic object.
        return <iframe src={publicUrl} className="w-full h-full bg-white" />;
      }

      // Assume Office Document (Word, Excel, PPT)
      // Use Microsoft Office Online Viewer
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
      return <iframe src={officeViewerUrl} className="w-full h-full bg-white" />;
    }

    // Default: Code Editor
    return <CodeViewer code={window.content || ""} language={window.language || "text"} />;
  }

  return (
    <Rnd
      default={{
        x: window.position?.x || 50,
        y: window.position?.y || 50,
        width: window.size?.width || 600,
        height: window.size?.height || 400,
      }}
      position={window.isMaximized ? { x: 0, y: 0 } : window.position}
      size={window.isMaximized ? { width: "100%", height: "100%" } : window.size}
      onDragStop={(e, d) => {
        if (!window.isMaximized) updateWindowPosition(window.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!window.isMaximized) {
          updateWindowSize(window.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
          updateWindowPosition(window.id, { x: position.x, y: position.y });
        }
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      style={{ zIndex: window.zIndex }}
      disableDragging={window.isMaximized}
      enableResizing={!window.isMaximized}
      onMouseDown={() => focusWindow(window.id)}
      className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-[#1e1e1e] backdrop-blur-md"
    >
      {/* Title Bar */}
      <div
        className="window-drag-handle h-10 bg-[#2d2d2d] border-b border-black/20 flex items-center justify-between px-4 select-none cursor-default"
        onDoubleClick={() => maximizeWindow(window.id)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-2 group">
            <button onClick={(e) => { e.stopPropagation(); closeWindow(window.id) }} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2" /></button>
            <button onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id) }} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center text-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity"><Minus className="w-2 h-2" /></button>
            <button onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id) }} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-[8px] text-black opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-2 h-2" /></button>
          </div>
          <span className="ml-4 text-xs font-medium text-gray-400 truncate max-w-[200px]">{window.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#0d1117] relative">
        {renderContent()}
      </div>
    </Rnd>
  );
}
