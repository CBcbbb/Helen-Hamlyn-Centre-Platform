import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { ACCENT } from '../utils/graphUtils';
import useDialogFocusTrap from '../hooks/useDialogFocusTrap';

const Modal = ({ showModal, setShowModal }) => {
  const [width, setWidth] = useState(50);
  const isDragging = useRef(false);
  const modalRef = useRef(null);

  const handleClose = useCallback(() => setShowModal(null), [setShowModal]);

  useDialogFocusTrap({ isOpen: !!showModal, onClose: handleClose, containerRef: modalRef });

  // Keyboard resize: provides a keyboard alternative to the drag resize interaction.
  useEffect(() => {
    if (!showModal) return undefined;

    const handleKeyResize = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setWidth(w => Math.max(20, w - 5));
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setWidth(w => Math.min(80, w + 5));
        }
      }
    };

    document.addEventListener('keydown', handleKeyResize);
    return () => document.removeEventListener('keydown', handleKeyResize);
  }, [showModal]);

  if (!showModal) return null;

  const handleMouseDown = (e) => {
    isDragging.current = true;
    e.preventDefault();
    
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const newWidth = (e.clientX / window.innerWidth) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
      setWidth(clampedWidth);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`
        fixed bg-white shadow-2xl border-gray-200 z-50 flex flex-col resizable-panel

        md:left-0 md:top-0 md:h-full md:border-r

        inset-0 md:inset-auto
      `}
      style={{ '--panel-width': `${width}%` }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      {/* Modal header — one heading (single accessible name across layouts),
          responsive classes swap the close-button style and helper text. */}
      <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setShowModal(null)}
          className="md:hidden p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          aria-label="Close dialog and return to main view"
        >
          <span className="text-lg" aria-hidden="true">←</span>
        </button>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h2 id="modal-title" className="text-lg md:text-2xl font-bold text-gray-900 truncate md:whitespace-normal">
            {showModal.label}
          </h2>
          <p className="hidden md:block text-sm text-gray-600 mt-1">
            Use Ctrl/Cmd + ← → to resize panel, or drag the right edge
          </p>
        </div>
        <button
          onClick={() => setShowModal(null)}
          className="hidden md:inline-flex p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          aria-label="Close dialog"
          title="Close"
        >
          <X size={20} className="text-gray-500" aria-hidden="true" />
        </button>
        {/* Balances the mobile back button's width so the title stays centered on mobile */}
        <div className="w-10 md:hidden flex-shrink-0" aria-hidden="true"></div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {showModal.content.split('\n').map((line, index) => {
              // Handle h1 headers
              if (line.startsWith('# ')) {
                return <h2 key={index} className="text-lg md:text-xl font-bold text-gray-900 mt-3 mb-1">{line.substring(2)}</h2>;
              }
              
              // Handle horizontal rules
              if (line.trim() === '---') {
                return <hr key={index} className="my-4 border-gray-300" />;
              }
              
              // Handle list items with links
              if (line.startsWith('- [') && line.includes('](') && line.includes(')')) {
                const linkRegex = /- \[([^\]]+)\]\(([^)]+)\)/;
                const match = line.match(linkRegex);
                if (match) {
                  return (
                    <p key={index} className="mb-2 ml-4">
                      • <a 
                          href={match[2]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: ACCENT, fontWeight: 'bold' }}
                        >
                          {match[1]}
                        </a>
                    </p>
                  );
                }
              }
              
              // Handle regular list items (first level)
              if (line.startsWith('- ') && !line.startsWith('  -')) {
                return (
                  <p key={index} className="mb-2 ml-4">
                    • {line.substring(2).split('**').map((part, partIndex) => {
                      if (partIndex % 2 === 1) {
                        return <strong key={partIndex}>{part}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              }
              
              // Handle nested list items (second level)
              if (line.startsWith('  - ')) {
                return (
                  <p key={index} className="mb-2 ml-8">
                    • {line.substring(4).split('**').map((part, partIndex) => {
                      if (partIndex % 2 === 1) {
                        return <strong key={partIndex}>{part}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              }
              
              // Handle bold text and links
              if (line.includes('**') || (line.includes('[') && line.includes('](') && line.includes(')'))) {
                
                // Process links
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                const parts = [];
                let lastIndex = 0;
                let match;
                
                while ((match = linkRegex.exec(line)) !== null) {
                  // Add text before link
                  if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                  }
                  
                  // Add link
                  parts.push(
                    <a 
                      key={match.index}
                      href={match[2]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: ACCENT, fontWeight: 'bold' }}
                    >
                      {match[1]}
                    </a>
                  );
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Add remaining text
                if (lastIndex < line.length) {
                  parts.push(line.substring(lastIndex));
                }
                
                // If no links found, handle bold text
                if (parts.length === 0 && line.includes('**')) {
                  const boldParts = line.split('**');
                  return (
                    <p key={index} className="mb-2">
                      {boldParts.map((part, partIndex) => {
                        if (partIndex % 2 === 1) {
                          return <strong key={partIndex}>{part}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                
                // Handle lines with links and also process bold text
                return (
                  <p key={index} className="mb-2">
                    {parts.map((part, partIndex) => {
                      if (typeof part === 'string' && part.includes('**')) {
                        const boldParts = part.split('**');
                        return boldParts.map((boldPart, boldIndex) => {
                          if (boldIndex % 2 === 1) {
                            return <strong key={`${partIndex}-${boldIndex}`}>{boldPart}</strong>;
                          }
                          return boldPart;
                        });
                      }
                      return part;
                    })}
                  </p>
                );
              }
              
              if (line.trim() === '') {
                return <br key={index} />;
              }
              
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
        </div>
      </div>
      
      <div 
        className="hidden md:block absolute right-0 top-0 w-1 h-full bg-gray-300 cursor-col-resize transition-colors"
        style={{ ':hover': { backgroundColor: ACCENT } }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.target.style.backgroundColor = ACCENT}
        onMouseLeave={(e) => e.target.style.backgroundColor = ''}
        title="Drag to resize"
      />
    </div>
  );
};

export default Modal;