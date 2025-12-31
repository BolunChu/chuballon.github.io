import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  type: 'editor' | 'preview' | 'browser' | 'finder' | 'settings' | 'doc-viewer';
  content?: string;
  language?: string;
  storagePath?: string; // For files
  mimeType?: string;    // For files
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface DesktopStore {
  windows: Record<string, WindowState>;
  activeWindowId: string | null;
  nextZIndex: number;

  openWindow: (window: WindowState) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void; // Toggle
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: {},
  activeWindowId: null,
  nextZIndex: 100,

  openWindow: (window) => {
    const { windows, nextZIndex } = get();
    // If already open, just focus and restore if minimized
    if (windows[window.id]) {
      set((state) => ({
        windows: {
          ...state.windows,
          [window.id]: { ...state.windows[window.id], isMinimized: false, zIndex: nextZIndex }
        },
        activeWindowId: window.id,
        nextZIndex: nextZIndex + 1
      }));
      return;
    }

    // Open new
    set((state) => ({
      windows: {
        ...state.windows,
        [window.id]: {
          ...window,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZIndex,
          // Default random position/size if not provided
          position: window.position || { x: 50 + Object.keys(state.windows).length * 20, y: 50 + Object.keys(state.windows).length * 20 },
          size: window.size || { width: 600, height: 400 }
        }
      },
      activeWindowId: window.id,
      nextZIndex: nextZIndex + 1
    }));
  },

  closeWindow: (id) => {
    set((state) => {
      const newWindows = { ...state.windows };
      delete newWindows[id];
      return { windows: newWindows, activeWindowId: null };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: true }
      },
      activeWindowId: null
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMaximized: !state.windows[id].isMaximized }
      },
      activeWindowId: id,
      // Bring to front even when maximizing
      nextZIndex: state.nextZIndex + 1
    }));
  },

  focusWindow: (id) => {
    const { nextZIndex } = get();
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], zIndex: nextZIndex, isMinimized: false }
      },
      activeWindowId: id,
      nextZIndex: nextZIndex + 1
    }));
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position }
      }
    }))
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], size }
      }
    }))
  }

}));
