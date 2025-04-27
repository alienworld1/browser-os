"use client";
import React from 'react';
import { useWindowManager } from '@/context/WindowManagerContext';
import { AppDefinition } from '@/types/os';
import Icon from './Icon';
import Window from './Window';

// Import ALL app components
import NotepadApp from '../apps/NotepadApp';
import AboutApp from '../apps/AboutApp';
import TicTacToeApp from '../apps/TicTacToeApp'; // Import TicTacToe
import CalculatorApp from '../apps/CalculatorApp'; // Import Calculator
import BrowserApp from '../apps/BrowserApp'; // Import Browser

// Define the available applications
const availableApps: AppDefinition[] = [
  { id: 'notepad', name: 'Notepad', icon: '/icons/notepad.png', component: NotepadApp },
  { id: 'about', name: 'About OS', icon: '/icons/about.png', component: AboutApp },
  // Add the new apps
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '/icons/tictactoe.png', component: TicTacToeApp },
  { id: 'calculator', name: 'Calculator', icon: '/icons/calculator.png', component: CalculatorApp },
  { id: 'browser', name: 'Web Browser', icon: '/icons/browser.png', component: BrowserApp },
];

const Desktop: React.FC = () => {
  const { windows, openWindow } = useWindowManager();

  return (
    <div className="relative flex-grow h-[calc(100vh-40px)] w-full overflow-hidden">
       {/* Desktop Background Image or Color */}
       <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600"></div>

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col items-start z-0">
        {availableApps.map((app) => (
          <Icon
            key={app.id}
            label={app.name}
            icon={app.icon}
            onDoubleClick={() => openWindow(app)}
          />
        ))}
      </div>

      {/* Render Open Windows */}
      {windows.map((win) => (
        <Window key={win.id} window={win} />
      ))}
    </div>
  );
};

export default Desktop;