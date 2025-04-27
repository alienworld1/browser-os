import { AppDefinition } from '@/types/os';

// Import app components (adjust paths if needed)
import NotepadApp from '@/components/apps/NotepadApp';
import AboutApp from '@/components/apps/AboutApp';
import TicTacToeApp from '@/components/apps/TicTacToeApp';
import CalculatorApp from '@/components/apps/CalculatorApp';
import BrowserApp from '@/components/apps/BrowserApp';
import FileExplorerApp from '@/components/apps/FileExplorerApp';
// Define the available applications
// Assign explicit IDs that we can reference in the file system
export const AVAILABLE_APPS: AppDefinition[] = [
  {
    id: 'notepad',
    name: 'Notepad',
    icon: '/icons/notepad.png',
    component: NotepadApp,
  },
  {
    id: 'about',
    name: 'About OS',
    icon: '/icons/about.png',
    component: AboutApp,
  },
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    icon: '/icons/tictactoe.png',
    component: TicTacToeApp,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: '/icons/calculator.png',
    component: CalculatorApp,
  },
  {
    id: 'browser',
    name: 'Web Browser',
    icon: '/icons/browser.png',
    component: BrowserApp,
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    icon: '/icons/folder.png',
    component: FileExplorerApp,
  }, // Add Explorer
];

// Helper function to find an app by its ID
export const findAppById = (id: string): AppDefinition | undefined => {
  return AVAILABLE_APPS.find(app => app.id === id);
};
