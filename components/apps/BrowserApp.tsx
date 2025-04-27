'use client';
import React, { useState, useRef, FormEvent } from 'react';

const BrowserApp: React.FC = () => {
  // Default to a site known to often allow embedding, or a simple info page
  const defaultUrl = 'https://vercel.com';
  const [currentUrl, setCurrentUrl] = useState<string>(defaultUrl);
  const [inputValue, setInputValue] = useState<string>(defaultUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formatUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Basic check, default to https
      return `https://${url}`;
    }
    return url;
  };

  const navigate = (url: string) => {
    const formattedUrl = formatUrl(url);
    setInputValue(formattedUrl); // Update input field as well
    setCurrentUrl(formattedUrl);
  };

  const handleGo = (event?: FormEvent) => {
    event?.preventDefault(); // Prevent form submission if used in a form
    navigate(inputValue);
  };

  // Note: Many websites will block embedding via the X-Frame-Options
  // or Content-Security-Policy headers. This is expected behavior.

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      {/* Address Bar */}
      <div className="flex items-center p-1 bg-gray-200 border-b border-gray-300">
        {/* Basic Nav Buttons (non-functional placeholders) */}
        <button className="px-2 py-0.5 text-sm text-gray-600 opacity-50 cursor-not-allowed">
          &lt;
        </button>
        <button className="px-2 py-0.5 text-sm text-gray-600 opacity-50 cursor-not-allowed">
          &gt;
        </button>
        <button className="px-2 py-0.5 text-sm text-gray-600 opacity-50 cursor-not-allowed">
          ↻
        </button>

        <form onSubmit={handleGo} className="flex-grow mx-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full px-2 py-0.5 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter URL (e.g., example.com)"
            aria-label="Address Bar"
          />
        </form>
        <button
          onClick={() => handleGo()}
          className="px-3 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
        >
          Go
        </button>
      </div>

      {/* Content Area (Iframe) */}
      <div className="flex-grow overflow-hidden">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-none"
          title="Mock Browser Content"
          // sandbox allows some scripts but restricts top navigation, etc.
          // Helps mitigate some risks but won't bypass X-Frame-Options.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onError={() =>
            console.warn(`Error loading or embedding ${currentUrl}`)
          }
        >
          <p>
            Your browser does not support iframes, or the content is blocked.
          </p>
        </iframe>
      </div>
      <div className="p-1 bg-gray-200 border-t border-gray-300 text-xs text-gray-600 truncate">
        {/* Status Bar Placeholder */}
        {`Loading: ${currentUrl}`}
        <span className="text-red-600">
          {' '}
          (Note: Many sites block embedding)
        </span>
      </div>
    </div>
  );
};

export default BrowserApp;
