// app/components/os/Window.tsx
'use client';
import React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import Image from 'next/image';
// Import ResizableBox and related types
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { WindowInstance } from '@/types/os';
import { useWindowManager } from '@/context/WindowManagerContext';

// Import the CSS for react-resizable (already added to globals.css, but good practice for component libraries)
// import 'react-resizable/css/styles.css'; // We added styles manually to globals.css

interface WindowProps {
  window: WindowInstance;
}

const Window: React.FC<WindowProps> = ({ window }) => {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowTitle,
  } = useWindowManager();
  const nodeRef = React.useRef<HTMLDivElement>(null);

  // Update position in context state when dragging stops
  const handleDragStop: DraggableEventHandler = (e, data) => {
    // Prevent updating position if the click was on a resize handle
    if (
      e.target instanceof Element &&
      e.target.classList.contains('react-resizable-handle')
    ) {
      return;
    }
    updateWindowPosition(window.id, data.x, data.y);
  };

  // Update size in context state when resizing stops
  const handleResizeStop = (
    event: React.SyntheticEvent,
    data: ResizeCallbackData,
  ) => {
    updateWindowSize(window.id, data.size.width, data.size.height);
  };

  // Bring window to front when clicked/dragged
  const handleFocus = (e: React.MouseEvent) => {
    // Prevent focus steal if clicking on window control buttons or resize handle
    if (e.target instanceof Element) {
      const targetClasses = e.target.classList;
      if (
        targetClasses.contains('window-control-button') ||
        targetClasses.contains('react-resizable-handle')
      ) {
        return;
      }
    }
    focusWindow(window.id);
  };

  return (
    <Draggable
      handle=".window-title-bar"
      position={{ x: window.x, y: window.y }}
      onStop={handleDragStop}
      onStart={e => handleFocus(e as unknown as React.MouseEvent)} // Cast needed sometimes or handle different event types
      bounds="parent"
      // @ts-ignore
      // This is a workaround for the type error with nodeRef
      nodeRef={nodeRef} // Use the ref for the draggable node
    >
      {/* This outer div is positioned by Draggable */}
      <div
        className="absolute" // Draggable applies transform, so position doesn't strictly matter here
        style={{
          zIndex: window.zIndex,
          display: window.isMinimized ? 'none' : 'block', // Use block for ResizableBox container
        }}
        onMouseDown={handleFocus} // Focus when any part of the window is clicked (unless prevented in handleFocus)
        ref={nodeRef} // Attach the ref to the outer div
        onClick={e => e.stopPropagation()} // Prevent event bubbling to parent elements
      >
        {/* ResizableBox controls the size and provides handles */}
        <ResizableBox
          width={window.width}
          height={window.height}
          onResizeStop={handleResizeStop}
          minConstraints={[250, 150]} // Example: Minimum width 250px, height 150px
          maxConstraints={[1200, 800]} // Example: Maximum width 1200px, height 800px
          // Enable multiple resize handles (optional)
          resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
          // Use default handle rendering based on CSS, or provide custom components:
          // handle={(handleAxis) => <span className={`react-resizable-handle react-resizable-handle-${handleAxis}`} />}
          className="shadow-lg rounded-t-md overflow-hidden" // Apply shadow/rounding here
        >
          {/* The actual window structure needs to fill the ResizableBox */}
          <div
            className="bg-gray-200 border border-gray-400 flex flex-col w-full h-full rounded-t-md"
            // Important: Width and height are now controlled by ResizableBox, use w-full/h-full
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {/* Title Bar */}
            <div className="window-title-bar bg-gradient-to-b from-blue-600 to-blue-800 text-white h-6 flex items-center justify-between px-2 cursor-move select-none flex-shrink-0">
              <div className="flex items-center space-x-1 overflow-hidden">
                <Image
                  src={window.icon}
                  alt=""
                  width={14}
                  height={14}
                  className="opacity-90"
                />
                <span className="text-xs font-semibold truncate">
                  {window.title}
                </span>
              </div>
              <div className="flex items-center space-x-1 window-controls">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                  className="w-4 h-4 bg-yellow-400 rounded-full hover:bg-yellow-500 text-black flex items-center justify-center text-xs font-bold window-control-button"
                  aria-label="Minimize"
                >
                  _
                </button>
                {/* Maximize Button Placeholder - could be implemented later */}
                {/* <button className="w-4 h-4 bg-green-400 rounded-full hover:bg-green-500 window-control-button" aria-label="Maximize (disabled)">+</button> */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-600 text-black flex items-center justify-center text-xs font-bold window-control-button"
                  aria-label="Close"
                >
                  X
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-grow overflow-auto bg-white">
              {' '}
              {/* Added bg-white here for contrast */}
              {/* Render the specific app component passed in */}
              {/* Wrap content in a div that definitely takes full space */}
              <div className="w-full h-full">
                <window.component
                  fileId={window.fileId}
                  updateTitle={(newTitle: string) =>
                    updateWindowTitle(window.id, newTitle)
                  }
                />
              </div>
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default Window;
