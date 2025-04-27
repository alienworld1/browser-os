'use client';
import React from 'react';
import Image from 'next/image';

interface IconProps {
  icon: string; // Path to icon
  label: string;
  onDoubleClick: () => void; // Action to perform on double click
}

const Icon: React.FC<IconProps> = ({ icon, label, onDoubleClick }) => {
  return (
    <button
      className="flex flex-col items-center justify-center w-20 h-24 p-2 m-1 text-center text-white text-xs hover:bg-blue-500 hover:bg-opacity-30 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      onDoubleClick={onDoubleClick}
      aria-label={`Open ${label}`}
    >
      <Image
        src={icon}
        alt={`${label} icon`}
        width={32}
        height={32}
        className="mb-1"
      />
      <span className="break-words line-clamp-2">{label}</span>
    </button>
  );
};

export default Icon;
