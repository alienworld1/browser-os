"use client";
import React from 'react';
import Image from 'next/image';
import { useWindowManager } from '@/context/WindowManagerContext';

const Taskbar: React.FC = () => {
  const { windows, focusWindow, minimizeWindow, restoreWindow } = useWindowManager();

  const handleTaskbarButtonClick = (id: string, isMinimized: boolean) => {
      if (isMinimized) {
          restoreWindow(id); // Restore and focus
      } else {
          // If it's already open and focused, minimize it. Otherwise, just focus.
          // This requires knowing the active window ID from context.
          // Clicking an active, non-minimized window's taskbar icon minimizes it.
           const isActive = windows.find(w => w.id === id)?.zIndex === Math.max(...windows.map(w => w.zIndex)); // Simple check if it's the topmost
           if (isActive) {
              minimizeWindow(id);
           } else {
              focusWindow(id);
           }
      }
  };


  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-800 to-black text-white flex items-center px-2 shadow-inner z-50">
      {/* Start Button Placeholder */}
      <button className="px-3 py-1 mr-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold">
        Start
      </button>

      {/* Open Window Buttons */}
      <div className="flex space-x-1 overflow-x-auto">
        {windows.map((win) => (
          <button
            key={win.id}
            onClick={() => handleTaskbarButtonClick(win.id, win.isMinimized)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs h-7 max-w-36 ${
              win.isMinimized ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-700 hover:bg-blue-600'
            } ${
              // Add highlight if it's the active window (highest z-index)
              !win.isMinimized && win.zIndex === Math.max(...windows.map(w => w.zIndex), 0) ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
            }`}
            title={win.title}
          >
             <Image src={win.icon} alt="" width={16} height={16} />
             <span className="truncate">{win.title}</span>
          </button>
        ))}
      </div>

      {/* Clock Placeholder (Right side) */}
      <div className="ml-auto text-xs pr-2">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default Taskbar;