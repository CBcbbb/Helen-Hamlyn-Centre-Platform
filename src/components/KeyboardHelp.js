import React from 'react';
import { X } from 'lucide-react';

const KeyboardHelp = ({ show, onClose }) => {
  if (!show) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${cmdKey} + E`, description: 'Toggle between Map and Table view' },
    { key: `${cmdKey} + K`, description: 'Focus search box' },
    { key: `${cmdKey} + B`, description: 'Toggle navigation sidebar' },
    { key: `${cmdKey} + ← →`, description: 'Resize panels (when modal or details open)' },
    { key: 'Escape', description: 'Close modals and detail panels' },
    { key: 'Tab / Shift + Tab', description: 'Navigate between elements' },
    { key: '?', description: 'Show this help' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-labelledby="help-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="help-title" className="text-xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close help"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-gray-600 ml-4 flex-1">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press Escape or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardHelp;
