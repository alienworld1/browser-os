'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { findAppById } from '@/data/availableApps'; // For getting app name

// Interface for props passed down from Window
interface NotepadAppProps {
  fileId?: string;
  updateTitle: (newTitle: string) => void;
}

const NotepadApp: React.FC<NotepadAppProps> = ({ fileId, updateTitle }) => {
  const { getNode, updateNodeContent, createNode, getParent } = useFileSystem();
  const [text, setText] = useState<string>('');
  const [currentFileId, setCurrentFileId] = useState<string | null>(
    fileId ?? null,
  );
  const [originalContent, setOriginalContent] = useState<string>(''); // To check for changes
  const [isLoading, setIsLoading] = useState<boolean>(!!fileId);
  const [currentTitle, setCurrentTitle] = useState<string>('Untitled');

  const notepadAppInfo = findAppById('notepad');
  const appName = notepadAppInfo?.name ?? 'Notepad';

  // Memoize the isDirty calculation to prevent unnecessary recalculations
  const isDirty = useMemo(
    () => text !== originalContent,
    [text, originalContent],
  );

  // Effect to load file content when fileId changes or is initially provided
  useEffect(() => {
    if (fileId) {
      setIsLoading(true);
      const node = getNode(fileId);
      if (node && node.type === 'file') {
        const content = node.content ?? '';
        setText(content);
        setOriginalContent(content);
        setCurrentFileId(fileId);
        setCurrentTitle(node.name);
      } else {
        console.error(`Notepad: Could not load file with ID ${fileId}`);
        setText('Error: Could not load file.');
        setOriginalContent('');
        setCurrentFileId(null);
        setCurrentTitle('Untitled');
      }
      setIsLoading(false);
    } else {
      // No fileId, start fresh
      setText('');
      setOriginalContent('');
      setCurrentFileId(null);
      setCurrentTitle('Untitled');
      setIsLoading(false);
    }
  }, [fileId, getNode]);

  // Update window title only when relevant state changes
  useEffect(() => {
    if (!isLoading) {
      const displayTitle = `${isDirty ? '*' : ''}${currentTitle} - ${appName}`;
      updateTitle(displayTitle);
    }
  }, [isDirty, currentTitle, appName, isLoading, updateTitle]);

  const handleSave = useCallback(async () => {
    if (currentFileId) {
      // --- Save existing file ---
      const success = updateNodeContent(currentFileId, text);
      if (success) {
        setOriginalContent(text); // Update original content baseline
        console.log('File saved successfully.');
        // Title update is handled by the isDirty effect
      } else {
        alert('Error: Could not save file.');
      }
    } else {
      // --- Save As new file ---
      const fileName = prompt(
        'Enter file name (.txt will be added if missing):',
        'Untitled.txt',
      );
      if (!fileName) return; // User cancelled

      const finalFileName = fileName.endsWith('.txt')
        ? fileName
        : `${fileName}.txt`;

      // Find Documents folder (simplification: save always to Documents)
      // A real app would need a file save dialog
      const rootNode = getNode('root');
      const docsNode = rootNode?.children
        ?.map(id => getNode(id))
        .find(n => n?.name === 'Documents');

      if (!docsNode || docsNode.type !== 'folder') {
        alert("Error: 'Documents' folder not found. Cannot save.");
        return;
      }

      const newNode = createNode(docsNode.id, finalFileName, 'file', {
        content: text,
        appId: 'notepad',
      });

      if (newNode) {
        setCurrentFileId(newNode.id);
        setOriginalContent(text);
        setCurrentTitle(finalFileName); // Update current title with new filename
        console.log('File saved successfully as:', finalFileName);
      } else {
        // Error message already shown by createNode via alert
        console.error('Failed to create new file.');
      }
    }
  }, [currentFileId, text, updateNodeContent, createNode, getNode]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading file...</div>;
  }

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      {/* Simple Menu Bar */}
      <div className="flex-shrink-0 bg-gray-100 border-b border-gray-300 p-1 flex space-x-2">
        <button
          onClick={handleSave}
          className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={!isDirty && !!currentFileId} // Disable save if not dirty (for existing files)
          title={currentFileId ? 'Save' : 'Save As...'}
        >
          {currentFileId ? 'Save' : 'Save As...'}
        </button>
        {/* Add more buttons like "File", "Edit" later */}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-grow w-full h-full resize-none border-none outline-none p-2 text-sm font-mono"
        spellCheck="false"
        aria-label="Notepad text area"
      />
    </div>
  );
};

export default NotepadApp;
