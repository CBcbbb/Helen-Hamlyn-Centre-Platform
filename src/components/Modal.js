import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ showModal, setShowModal }) => {
  const [width, setWidth] = useState(50);
  const isDragging = useRef(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (showModal) {
      // Save current focus
      previousFocusRef.current = document.activeElement;
      
      // Set focus to modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Escape key handler
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setShowModal(null);
        }
      };
      
      // Keyboard resize - WCAG 2.2 AA compliant (2.5.7)
      const handleKeyResize = (e) => {
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const newWidth = Math.max(20, width - 5);
            setWidth(newWidth);
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            const newWidth = Math.min(80, width + 5);
            setWidth(newWidth);
          }
        }
      };
      
      // Focus trap
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
              // Shift + Tab
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              // Tab
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyResize);
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyResize);
        document.removeEventListener('keydown', handleTabKey);
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [showModal, setShowModal, width]);

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
        fixed bg-white shadow-2xl border-gray-200 z-50 flex flex-col
        
        md:left-0 md:top-0 md:h-full md:border-r
        
        inset-0 md:inset-auto
      `}
      style={{ width: window.innerWidth > 768 ? `${width}%` : '100%' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      {/* Mobile top navigation bar */}
      <div className="flex items-center p-4 border-b bg-gray-50 md:hidden">
        <button
          onClick={() => setShowModal(null)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          aria-label="Close dialog and return to main view"
        >
          <span className="text-lg">←</span>
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">{showModal.label}</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Desktop modal header */}
      <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{showModal.label}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Use Ctrl/Cmd + ← → to resize panel, or drag the right edge
          </p>
        </div>
        <button
          onClick={() => setShowModal(null)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Close dialog"
          title="Close"
        >
          <X size={20} className="text-gray-500" />
        </button>
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
                          style={{ color: '#00837F', fontWeight: 'bold' }}
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
                      style={{ color: '#00837F', fontWeight: 'bold' }}
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
        style={{ ':hover': { backgroundColor: '#00837F' } }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#00837F'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#d1d5db'}
        title="Drag to resize"
      />
    </div>
  );
};

export default Modal;