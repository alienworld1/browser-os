'use client';

import Desktop from '@/components/os/Desktop';
import Taskbar from '@/components/os/Taskbar';

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-black">
      {/* Desktop takes available space */}
      <Desktop />
      {/* Taskbar is fixed at the bottom */}
      <Taskbar />
    </main>
  );
}
