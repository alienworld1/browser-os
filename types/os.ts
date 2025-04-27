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
  id: string;
  appId: string;
  title: string; // Title might now be dynamic (e.g., "filename.txt - Notepad")
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  component: React.ComponentType<any>;
  fileId?: string; // Optional: ID of the file this window has open
}

// Defines the state and actions for the Window Manager Context
export interface WindowManagerContextType {
  windows: WindowInstance[];
  // Allow passing options like fileId when opening
  openWindow: (app: AppDefinition, options?: { fileId?: string }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  // --- NEW Function ---
  updateWindowTitle: (id: string, title: string) => void;
}

export type NodeType = 'file' | 'folder';

export interface FileSystemNode {
  id: string; // Unique ID (e.g., uuid)
  name: string;
  type: NodeType;
  parentId: string | null; // ID of the parent folder, null for root
  children?: string[]; // List of child node IDs (for folders)
  appId?: string; // Optional: Which app opens this file type? Matches AppDefinition.id
  content?: string; // Optional: Simple content for text files etc.
}

// Map structure for storing nodes by ID
export type FileSystemNodes = Record<string, FileSystemNode>;

export interface FileSystemContextType {
  nodes: FileSystemNodes;
  rootId: string;
  getNode: (id: string) => FileSystemNode | undefined;
  getChildren: (id: string) => FileSystemNode[];
  getParent: (id: string) => FileSystemNode | undefined;
  getPathString: (id: string) => string; // Helper to get full path
  createNode: (
    parentId: string,
    name: string,
    type: NodeType,
    options?: { content?: string; appId?: string },
  ) => FileSystemNode | null;
  updateNodeContent: (id: string, content: string) => boolean;
  renameNode: (id: string, newName: string) => boolean;
  deleteNode: (id: string) => boolean;
}
