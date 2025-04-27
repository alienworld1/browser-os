"use client";
import React, { useState } from 'react';

const NotepadApp: React.FC = () => {
  const [text, setText] = useState("This is a simple notepad.\nStart typing...");

  return (
    <div className="w-full h-full bg-white text-black p-1 flex flex-col">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow w-full h-full resize-none border-none outline-none p-2 text-sm font-mono"
        spellCheck="false"
      />
    </div>
  );
};

export default NotepadApp;