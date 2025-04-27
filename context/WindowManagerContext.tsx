'use client';

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import {
  WindowInstance,
  AppDefinition,
  WindowManagerContextType,
} from '../types/os';
import { v4 as uuidv4 } from 'uuid';
import { useFileSystem } from './FileSystemContext';

const WindowManagerContext = createContext<
  WindowManagerContextType | undefined
>(undefined);

const INITIAL_Z_INDEX = 10; // Base z-index for windows

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState<number>(INITIAL_Z_INDEX);
  const { getNode } = useFileSystem();

  const openWindow = useCallback(
    (app: AppDefinition, options?: { fileId?: string }) => {
      let initialTitle = app.name;
      let fileId = options?.fileId;

      // If a fileId is provided, try to set the initial title based on the file name
      if (fileId) {
        const fileNode = getNode(fileId);
        if (fileNode && fileNode.type === 'file') {
          initialTitle = `${fileNode.name} - ${app.name}`; // e.g., "README.txt - Notepad"
        } else {
          console.warn(
            `File ID ${fileId} provided to openWindow but node not found or not a file.`,
          );
          fileId = undefined; // Invalidate fileId if node isn't valid
        }
      }

      setWindows(prevWindows => {
        const newWindowId = uuidv4();
        const newZIndex = nextZIndex;
        setNextZIndex(prev => prev + 1);
        const offset = (prevWindows.length % 10) * 20;

        const newWindow: WindowInstance = {
          id: newWindowId,
          appId: app.id,
          title: initialTitle, // Use potentially updated title
          icon: app.icon,
          x: 100 + offset,
          y: 100 + offset,
          width: fileId ? 500 : 400, // Maybe make file windows slightly larger?
          height: fileId ? 400 : 300,
          zIndex: newZIndex,
          isMinimized: false,
          component: app.component,
          fileId: fileId, // Store the fileId
        };
        setActiveWindowId(newWindowId);
        return [...prevWindows, newWindow];
      });
    },
    [nextZIndex, getNode],
  );

  const closeWindow = useCallback(
    (id: string) => {
      setWindows(prevWindows => prevWindows.filter(win => win.id !== id));
      // Optional: Set focus to the next highest z-index window if the closed one was active
      if (activeWindowId === id) {
        setActiveWindowId(null); // Or find the next highest window
      }
    },
    [activeWindowId],
  );

  const focusWindow = useCallback(
    (id: string) => {
      if (id === activeWindowId) return; // Already focused

      setWindows(prevWindows =>
        prevWindows.map(win => {
          if (win.id === id) {
            const newZIndex = nextZIndex;
            setNextZIndex(prev => prev + 1);
            setActiveWindowId(id);
            return { ...win, zIndex: newZIndex, isMinimized: false }; // Also restore if minimized
          }
          return win;
        }),
      );
    },
    [activeWindowId, nextZIndex],
  ); // Added nextZIndex dependency

  const minimizeWindow = useCallback(
    (id: string) => {
      setWindows(prevWindows =>
        prevWindows.map(win =>
          win.id === id ? { ...win, isMinimized: true } : win,
        ),
      );
      // Optional: Set focus to the next highest z-index window if the minimized one was active
      if (activeWindowId === id) {
        setActiveWindowId(null); // Or find the next highest window
      }
    },
    [activeWindowId],
  );

  const restoreWindow = useCallback(
    (id: string) => {
      focusWindow(id); // Restoring implies focusing
      // The focusWindow logic already handles setting isMinimized to false
    },
    [focusWindow],
  );

  const updateWindowPosition = useCallback(
    (id: string, x: number, y: number) => {
      setWindows(prevWindows =>
        prevWindows.map(win => (win.id === id ? { ...win, x, y } : win)),
      );
    },
    [],
  );

  const updateWindowSize = useCallback(
    (id: string, width: number, height: number) => {
      setWindows(prevWindows =>
        prevWindows.map(win =>
          win.id === id ? { ...win, width, height } : win,
        ),
      );
    },
    [],
  );

  const updateWindowTitle = useCallback((id: string, title: string) => {
    setWindows(prevWindows =>
      prevWindows.map(win => (win.id === id ? { ...win, title: title } : win)),
    );
  }, []);

  const contextValue: WindowManagerContextType = {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowTitle,
  };

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
};

// Custom hook to use the WindowManager context
export const useWindowManager = (): WindowManagerContextType => {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error(
      'useWindowManager must be used within a WindowManagerProvider',
    );
  }
  return context;
};
