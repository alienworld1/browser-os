import React from 'react';

// Defines the structure for an available application
export interface AppDefinition {
  id: string; // Unique identifier for the app type
  name: string;
  icon: string; // Path to the icon image
  component: React.ComponentType<any>; // The React component for the app window content
}

// Defines the structure for an open window instance
export interface WindowInstance {
  id: string; // Unique identifier for this specific window instance (e.g., uuid)
  appId: string; // Which app definition this window belongs to
  title: string;
  icon: string;
  x: number; // Position
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  component: React.ComponentType<any>; // The actual component to render
}

// Defines the state and actions for the Window Manager Context
export interface WindowManagerContextType {
  windows: WindowInstance[];
  openWindow: (app: AppDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void; // Add this line
}