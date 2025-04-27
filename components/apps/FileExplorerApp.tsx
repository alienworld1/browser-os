'use client';

import React, { useState, useCallback } from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { useWindowManager } from '@/context/WindowManagerContext';
import { FileSystemNode } from '@/types/os';
import { findAppById } from '@/data/availableApps';

import FolderIcon from '@/components/icons/FolderIcon';
import FileIcon from '@/components/icons/FileIcon';

const FileExplorerApp: React.FC = () => {
  const {
    rootId,
    getChildren,
    getParent,
    getNode,
    getPathString,
    renameNode,
    deleteNode,
    createNode, // Get CRUD functions
  } = useFileSystem();
  const { openWindow } = useWindowManager();
  const [currentFolderId, setCurrentFolderId] = useState<string>(rootId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // For actions

  const currentFolder = getNode(currentFolderId);
  const items = getChildren(currentFolderId);
  const currentPath = getPathString(currentFolderId);

  const handleNavigate = (node: FileSystemNode) => {
    setSelectedNodeId(null); // Deselect on navigate/open
    if (node.type === 'folder') {
      setCurrentFolderId(node.id);
    } else if (node.type === 'file') {
      if (node.appId) {
        const appToOpen = findAppById(node.appId);
        if (appToOpen) {
          console.log(
            `Opening file "${node.name}" with app "${appToOpen.name}"`,
          );
          // --- Pass fileId when opening ---
          openWindow(appToOpen, { fileId: node.id });
        } else {
          alert(
            `No application available to open "${node.name}" (App ID: ${node.appId})`,
          );
        }
      } else {
        alert(
          `Don't know how to open "${node.name}". No associated application.`,
        );
      }
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedNodeId(id);
  };

  const handleGoUp = () => {
    setSelectedNodeId(null); // Deselect
    const parent = getParent(currentFolderId);
    if (parent) {
      setCurrentFolderId(parent.id);
    }
  };

  // --- Action Handlers ---
  const handleRename = useCallback(() => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;

    const currentName = node.name;
    const newName = prompt(`Enter new name for "${currentName}":`, currentName);

    if (newName && newName !== currentName) {
      const success = renameNode(selectedNodeId, newName);
      if (success) {
        setSelectedNodeId(null); // Deselect after successful rename
      }
      // Error alerts handled within renameNode context function
    }
  }, [selectedNodeId, renameNode, getNode]);

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${node.name}"?`,
    );
    if (confirmDelete) {
      const success = deleteNode(selectedNodeId);
      if (success) {
        setSelectedNodeId(null); // Deselect after successful delete
      }
      // Error alerts handled within deleteNode context function
    }
  }, [selectedNodeId, deleteNode, getNode]);

  const handleCreateFolder = useCallback(() => {
    const folderName = prompt('Enter new folder name:', 'New Folder');
    if (folderName) {
      const newNode = createNode(currentFolderId, folderName, 'folder');
      if (newNode) {
        // Optional: select the new folder?
        // setSelectedNodeId(newNode.id);
      }
    }
  }, [currentFolderId, createNode]);

  const handleCreateTextFile = useCallback(() => {
    const fileName = prompt(
      'Enter new file name (.txt will be added):',
      'New Text File.txt',
    );
    if (fileName) {
      const finalFileName = fileName.endsWith('.txt')
        ? fileName
        : `${fileName}.txt`;
      const newNode = createNode(currentFolderId, finalFileName, 'file', {
        content: '',
        appId: 'notepad',
      });
      if (newNode) {
        // Optional: select the new file?
        // setSelectedNodeId(newNode.id);
      }
    }
  }, [currentFolderId, createNode]);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col text-sm">
      {/* Toolbar */}
      <div className="flex items-center p-1 bg-gray-100 border-b border-gray-300 flex-shrink-0 space-x-1">
        <button
          onClick={handleGoUp}
          disabled={!currentFolder?.parentId}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go Up"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <input
          type="text"
          value={currentPath}
          readOnly
          className="flex-grow px-2 py-1 border rounded text-xs bg-white"
          aria-label="Current Path"
        />
        {/* --- Action Buttons --- */}
        <button
          onClick={handleCreateFolder}
          className="px-2 py-0.5 text-xs border rounded bg-white hover:bg-gray-100"
          title="New Folder"
        >
          New Folder
        </button>
        <button
          onClick={handleCreateTextFile}
          className="px-2 py-0.5 text-xs border rounded bg-white hover:bg-gray-100"
          title="New Text File"
        >
          New Text File
        </button>
        <button
          onClick={handleRename}
          disabled={!selectedNodeId}
          className="px-2 py-0.5 text-xs border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rename"
        >
          Rename
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedNodeId}
          className="px-2 py-0.5 text-xs border rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete"
        >
          Delete
        </button>
      </div>

      {/* File/Folder List */}
      <div className="flex-grow overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            </svg>
            <p>This folder is empty</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => handleSelectItem(item.id)} // Select on single click
                  onDoubleClick={() => handleNavigate(item)}
                  className={`w-full flex items-center space-x-2 p-1 rounded text-left focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    selectedNodeId === item.id
                      ? 'bg-blue-200'
                      : 'hover:bg-blue-100' // Highlight selected
                  }`}
                  title={`Name: ${item.name}`}
                >
                  {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-1 bg-gray-100 border-t border-gray-300 text-xs text-gray-600 flex-shrink-0">
        {items.length} item(s){' '}
        {selectedNodeId
          ? `| Selected: ${getNode(selectedNodeId)?.name ?? '...'}`
          : ''}
      </div>
    </div>
  );
};

export default FileExplorerApp;
