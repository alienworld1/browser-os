'use client';

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import {
  FileSystemNode,
  FileSystemNodes,
  FileSystemContextType,
  NodeType,
} from '../types/os';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined,
);

// --- Initial File System Structure ---
const rootId = 'root';
const documentsId = uuidv4();
const picturesId = uuidv4();
const readmeId = uuidv4();

const initialNodes: FileSystemNodes = {
  [rootId]: {
    id: rootId,
    name: 'C:',
    type: 'folder',
    parentId: null,
    children: [documentsId, picturesId, readmeId],
  },
  [documentsId]: {
    id: documentsId,
    name: 'Documents',
    type: 'folder',
    parentId: rootId,
    children: [],
  },
  [picturesId]: {
    id: picturesId,
    name: 'Pictures',
    type: 'folder',
    parentId: rootId,
    children: [],
  },
  [readmeId]: {
    id: readmeId,
    name: 'README.txt',
    type: 'file',
    parentId: rootId,
    appId: 'notepad',
    content: 'Welcome to Browser OS!\n\nThis is a simple text file.',
  },
};

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes] = useState<FileSystemNodes>(initialNodes);

  const getNode = useCallback(
    (id: string): FileSystemNode | undefined => {
      return nodes[id];
    },
    [nodes],
  );

  const getChildren = useCallback(
    (id: string): FileSystemNode[] => {
      const parentNode = nodes[id];
      if (!parentNode || parentNode.type !== 'folder' || !parentNode.children) {
        return [];
      }
      return parentNode.children
        .map(childId => nodes[childId])
        .filter((node): node is FileSystemNode => !!node) // Type guard to filter out undefined
        .sort((a, b) => {
          // Sort folders first, then alphabetically
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
    },
    [nodes],
  );

  const getParent = useCallback(
    (id: string): FileSystemNode | undefined => {
      const node = nodes[id];
      if (!node || !node.parentId) {
        return undefined;
      }
      return nodes[node.parentId];
    },
    [nodes],
  );

  const getPathString = useCallback(
    (id: string): string => {
      let currentNode = nodes[id];
      let path = '';
      while (currentNode) {
        path = `${currentNode.name}${path ? '/' + path : ''}`;
        if (!currentNode.parentId) break; // Reached root
        currentNode = nodes[currentNode.parentId];
        if (!currentNode) break; // Should not happen in a consistent FS
      }
      // Replace root name "C:" with "C:/" for conventional look
      return path.startsWith('C:') ? path.replace('C:', 'C:/') : path;
    },
    [nodes],
  );

  const createNode = useCallback(
    (
      parentId: string,
      name: string,
      type: NodeType,
      options: { content?: string; appId?: string } = {},
    ): FileSystemNode | null => {
      const parentNode = nodes[parentId];
      if (!parentNode || parentNode.type !== 'folder') {
        console.error(
          'CreateNode Error: Invalid parent or parent is not a folder.',
        );
        return null;
      }

      // Check for name collision
      const siblings =
        parentNode.children?.map(id => nodes[id]).filter(Boolean) ?? [];
      if (siblings.some(node => node?.name === name)) {
        console.error(
          `CreateNode Error: Node with name "${name}" already exists in parent "${parentNode.name}".`,
        );
        alert(`Error: A file or folder named "${name}" already exists here.`);
        return null;
      }

      const newNodeId = uuidv4();
      const newNode: FileSystemNode = {
        id: newNodeId,
        name,
        type,
        parentId,
        content: options.content,
        appId: options.appId,
        ...(type === 'folder' && { children: [] }), // Add children array for folders
      };

      setNodes(prevNodes => {
        // Immutable update
        const updatedParent = {
          ...prevNodes[parentId],
          children: [...(prevNodes[parentId].children ?? []), newNodeId],
        };
        return {
          ...prevNodes,
          [newNodeId]: newNode,
          [parentId]: updatedParent,
        };
      });

      console.log(
        `Node created: ${name} (ID: ${newNodeId}) in parent ${parentId}`,
      );
      return newNode;
    },
    [nodes],
  );

  const updateNodeContent = useCallback(
    (id: string, content: string): boolean => {
      const node = nodes[id];
      if (!node || node.type !== 'file') {
        console.error(
          'UpdateNodeContent Error: Node not found or is not a file.',
        );
        return false;
      }

      setNodes(prevNodes => ({
        ...prevNodes,
        [id]: { ...prevNodes[id], content },
      }));
      console.log(`Node content updated: ${node.name} (ID: ${id})`);
      return true;
    },
    [nodes],
  );

  const renameNode = useCallback(
    (id: string, newName: string): boolean => {
      const node = nodes[id];
      if (!node) {
        console.error('RenameNode Error: Node not found.');
        return false;
      }
      if (!node.parentId) {
        console.error('RenameNode Error: Cannot rename root.');
        return false; // Cannot rename root
      }
      const parentNode = nodes[node.parentId];
      if (!parentNode || parentNode.type !== 'folder') {
        console.error('RenameNode Error: Parent not found or is not a folder.');
        return false; // Should not happen in consistent state
      }

      // Check for name collision with new name
      const siblings =
        parentNode.children?.map(childId => nodes[childId]).filter(Boolean) ??
        [];
      if (siblings.some(n => n?.id !== id && n?.name === newName)) {
        console.error(
          `RenameNode Error: Node with name "${newName}" already exists in parent "${parentNode.name}".`,
        );
        alert(
          `Error: A file or folder named "${newName}" already exists here.`,
        );
        return false;
      }

      setNodes(prevNodes => ({
        ...prevNodes,
        [id]: { ...prevNodes[id], name: newName },
      }));
      console.log(`Node renamed: ${node.name} -> ${newName} (ID: ${id})`);
      return true;
    },
    [nodes],
  );

  const deleteNode = useCallback(
    (id: string): boolean => {
      const node = nodes[id];
      if (!node) {
        console.error('DeleteNode Error: Node not found.');
        return false;
      }
      if (!node.parentId) {
        console.error('DeleteNode Error: Cannot delete root node.');
        alert('Error: Cannot delete the root drive.');
        return false; // Cannot delete root
      }
      const parentNode = nodes[node.parentId];
      if (!parentNode || parentNode.type !== 'folder') {
        console.error('DeleteNode Error: Parent not found or invalid.');
        return false; // Should not happen
      }

      // Prevent deleting non-empty folders (for simplicity)
      if (node.type === 'folder' && node.children && node.children.length > 0) {
        console.warn(
          `DeleteNode Warning: Attempted to delete non-empty folder "${node.name}".`,
        );
        alert(
          `Error: Cannot delete folder "${node.name}" because it is not empty.`,
        );
        return false;
      }

      setNodes(prevNodes => {
        const newNodes = { ...prevNodes };
        // 1. Remove node itself
        delete newNodes[id];
        // 2. Remove node from parent's children list
        const updatedParent = {
          ...newNodes[node.parentId!], // parentId is checked above
          children:
            newNodes[node.parentId!].children?.filter(
              childId => childId !== id,
            ) ?? [],
        };
        newNodes[node.parentId!] = updatedParent;

        // TODO: If deleting a folder, could recursively delete children here
        // For now, we prevent deleting non-empty folders above.

        return newNodes;
      });
      console.log(`Node deleted: ${node.name} (ID: ${id})`);
      return true;
    },
    [nodes],
  );

  // --- Context Value ---
  const contextValue: FileSystemContextType = {
    nodes,
    rootId,
    getNode,
    getChildren,
    getParent,
    getPathString,
    createNode,
    updateNodeContent,
    renameNode,
    deleteNode,
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

// Custom hook
export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
