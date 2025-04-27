// app/components/os/Taskbar.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useWindowManager } from '@/context/WindowManagerContext';
import { usePathname } from 'next/navigation';

import { AVAILABLE_APPS, findAppById } from '@/data/availableApps';
import { AppDefinition } from '@/types/os';

const Taskbar: React.FC = () => {
  const { windows, focusWindow, minimizeWindow, restoreWindow, openWindow } =
    useWindowManager();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the menu itself
  const startButtonRef = useRef<HTMLButtonElement>(null); // Ref for the start button

  // Use pathname to close menu on navigation (though less relevant in single-page OS)
  const pathname = usePathname();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu if clicking outside of it or the start button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        startButtonRef.current &&
        !startButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); // Only re-run if isMenuOpen changes

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAppClick = (app: AppDefinition) => {
    openWindow(app);
    setIsMenuOpen(false); // Close menu after opening app
  };

  const handleTaskbarButtonClick = (id: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(id); // Restore and focus
    } else {
      // If it's already open and focused, minimize it. Otherwise, just focus.
      // This requires knowing the active window ID from context.
      // Let's simplify: clicking an active, non-minimized window's taskbar icon minimizes it.
      const isActive =
        windows.find(w => w.id === id)?.zIndex ===
        Math.max(...windows.map(w => w.zIndex)); // Simple check if it's the topmost
      if (isActive) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    }
  };

  return (
    // Relative positioning needed for the absolute menu
    <div className="relative">
      {/* Start Menu (conditionally rendered) */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-10 left-0 w-64 bg-gradient-to-b from-gray-800 via-gray-900 to-black border border-gray-600 rounded-t-md shadow-lg z-40 p-2 max-h-96 overflow-y-auto" // Positioned above taskbar
        >
          <div className="flex items-center p-2 border-b border-gray-700 mb-2">
            {/* Optional: User profile pic/name placeholder */}
            <div className="w-10 h-10 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
            <div className="text-white font-semibold">alienworld</div>
          </div>
          <ul className="space-y-1">
            {AVAILABLE_APPS.map(app => (
              // Exclude File Explorer maybe? Or keep all. Let's keep all for now.
              <li key={app.id}>
                <button
                  onClick={() => handleAppClick(app)}
                  className="w-full flex items-center space-x-3 p-1.5 rounded text-white text-sm hover:bg-blue-700 focus:outline-none focus:bg-blue-600 transition-colors duration-100"
                >
                  <Image
                    src={app.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                  />
                  <span>{app.name}</span>
                </button>
              </li>
            ))}
            {/* Optional: Separator and Power/Settings buttons */}
            <hr className="border-gray-700 my-2" />
            {/* Add placeholder buttons for settings/power if desired */}
          </ul>
        </div>
      )}

      {/* The actual taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-800 to-black text-white flex items-center px-2 shadow-inner z-50">
        {/* Start Button */}
        <button
          ref={startButtonRef}
          onClick={toggleMenu}
          className={`px-3 py-1 mr-2 rounded text-sm font-semibold ${
            isMenuOpen ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'
          }`}
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          Start
        </button>

        {/* Open Window Buttons */}
        <div className="flex space-x-1 overflow-x-auto">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => handleTaskbarButtonClick(win.id, win.isMinimized)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs h-7 max-w-36 ${
                win.isMinimized
                  ? 'bg-gray-600 hover:bg-gray-500'
                  : 'bg-blue-700 hover:bg-blue-600'
              } ${
                !win.isMinimized &&
                win.zIndex === Math.max(...windows.map(w => w.zIndex), 0)
                  ? 'ring-2 ring-blue-400 ring-opacity-75'
                  : ''
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
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
