"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { WindowInstance, AppDefinition, WindowManagerContextType } from '../types/os';
import { v4 as uuidv4 } from 'uuid';

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

const INITIAL_Z_INDEX = 10; // Base z-index for windows

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState<number>(INITIAL_Z_INDEX);

  const openWindow = useCallback((app: AppDefinition) => {
    setWindows((prevWindows) => {
      const newWindowId = uuidv4();
      const newZIndex = nextZIndex;
      setNextZIndex(prev => prev + 1); // Increment z-index for the next window

      // Basic cascading position for new windows
      const offset = (prevWindows.length % 10) * 20; // Simple cascade

      const newWindow: WindowInstance = {
        id: newWindowId,
        appId: app.id,
        title: app.name,
        icon: app.icon,
        x: 100 + offset,
        y: 100 + offset,
        width: 400,
        height: 300,
        zIndex: newZIndex,
        isMinimized: false,
        component: app.component,
      };
      setActiveWindowId(newWindowId); // Make the new window active
      return [...prevWindows, newWindow];
    });
  }, [nextZIndex]); // Added nextZIndex dependency

  const closeWindow = useCallback((id: string) => {
    setWindows((prevWindows) => prevWindows.filter((win) => win.id !== id));
    // Optional: Set focus to the next highest z-index window if the closed one was active
    if (activeWindowId === id) {
       setActiveWindowId(null); // Or find the next highest window
    }
  }, [activeWindowId]);

  const focusWindow = useCallback((id: string) => {
    if (id === activeWindowId) return; // Already focused

    setWindows((prevWindows) =>
      prevWindows.map((win) => {
        if (win.id === id) {
          const newZIndex = nextZIndex;
          setNextZIndex(prev => prev + 1);
          setActiveWindowId(id);
          return { ...win, zIndex: newZIndex, isMinimized: false }; // Also restore if minimized
        }
        return win;
      })
    );
  }, [activeWindowId, nextZIndex]); // Added nextZIndex dependency

  const minimizeWindow = useCallback((id: string) => {
      setWindows((prevWindows) =>
        prevWindows.map((win) =>
          win.id === id ? { ...win, isMinimized: true } : win
        )
      );
      // Optional: Set focus to the next highest z-index window if the minimized one was active
       if (activeWindowId === id) {
           setActiveWindowId(null); // Or find the next highest window
       }
  }, [activeWindowId]);

  const restoreWindow = useCallback((id: string) => {
    focusWindow(id); // Restoring implies focusing
    // The focusWindow logic already handles setting isMinimized to false
  }, [focusWindow]);


  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows((prevWindows) =>
      prevWindows.map((win) => (win.id === id ? { ...win, x, y } : win))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows((prevWindows) =>
      prevWindows.map((win) =>
        win.id === id ? { ...win, width, height } : win
      )
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
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};