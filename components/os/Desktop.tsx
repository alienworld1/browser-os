'use client';
import React from 'react';
import { useWindowManager } from '@/context/WindowManagerContext';
import Icon from './Icon';
import Window from './Window';

import { AVAILABLE_APPS } from '@/data/availableApps';

const Desktop: React.FC = () => {
  // Note: openWindow now comes from useWindowManager, which gets the full AppDefinition
  const { windows, openWindow } = useWindowManager();

  return (
    // Desktop area - takes full viewport height minus taskbar, relative for window positioning
    <div className="relative flex-grow h-[calc(100vh-40px)] w-full overflow-hidden">
      {/* Desktop Background Image or Color */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col items-start z-0">
        {/* Use the imported AVAILABLE_APPS list */}
        {AVAILABLE_APPS.map(app => (
          <Icon
            key={app.id}
            label={app.name}
            icon={app.icon}
            onDoubleClick={() => openWindow(app)}
          />
        ))}
      </div>

      {/* Render Open Windows */}
      {windows.map(win => (
        <Window key={win.id} window={win} />
      ))}
    </div>
  );
};

export default Desktop;
