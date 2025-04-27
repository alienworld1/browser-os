'use client';
import React from 'react';

const AboutApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-100 text-black p-4 flex flex-col items-center justify-center text-sm">
      <h2 className="text-lg font-semibold mb-2">Browser OS v0.1</h2>
      <p className="mb-1">A Mock Operating System in the Browser.</p>
      <p>Fancy stuff, yes.</p>
      <p className="mt-4 text-xs text-gray-600">© 2025</p>
    </div>
  );
};

export default AboutApp;
