import React, { useState, useRef, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getNodeColor } from '../utils/graphUtils';

const NodeDetails = ({ selectedNode, onNodeSelection, data }) => {
  const [width, setWidth] = useState(50);
  const isDragging = useRef(false);
  const detailsRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Convert URLs in text to clickable links
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 underline break-all"
            style={{ color: '#148D66' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Format text with bold before colons
  const renderFormattedText = (text, fieldType) => {
    if (!text) return null;
    
    // Handle step lists (numbered items) - bold text before colon
    if (fieldType === 'steps') {
      const items = text.split(/(?=\d+\.)/);
      return items.map((item, index) => {
        if (item.trim()) {
          const colonIndex = item.indexOf(':');
          if (colonIndex > -1) {
            const title = item.substring(0, colonIndex + 1);
            const description = item.substring(colonIndex + 1);
            return (
              <div key={index} className="mb-4">
                <span className="font-bold">{title}</span>
                <span> {renderTextWithLinks(description)}</span>
              </div>
            );
          }
          return (
            <div key={index} className="mb-4">
              {renderTextWithLinks(item)}
            </div>
          );
        }
        return null;
      });
    }
    
    // Handle challenge/condition lists (add bullet points)
    if (fieldType === 'challenges' || fieldType === 'conditions' || fieldType === 'legacy' || fieldType === 'project_challenges') {
      const paragraphs = text.split('\n').filter(p => p.trim());
      
      // Choose color based on field type
      const bulletColor = (fieldType === 'legacy' || fieldType === 'project_challenges') 
        ? 'text-orange-600'
        : 'text-green-600';
        
      return paragraphs.map((para, index) => (
        <div key={index} className="mb-3 flex items-start">
          <span className={`${bulletColor} mr-2 mt-1`}>•</span>
          <span className="flex-1">{renderTextWithLinks(para.trim())}</span>
        </div>
      ));
    }
    
    // Default handling
    return renderTextWithLinks(text);
  };

  // Focus management
  useEffect(() => {
    if (selectedNode) {
      // Save current focus
      previousFocusRef.current = document.activeElement;
      
      // Set focus to details panel
      setTimeout(() => {
        detailsRef.current?.focus();
      }, 100);
      
      // Escape key handler
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onNodeSelection(null);
        }
      };
      
      // Keyboard resize - WCAG 2.2 AA compliant (2.5.7)
      const handleKeyResize = (e) => {
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const newWidth = Math.min(80, width + 5);
            setWidth(newWidth);
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            const newWidth = Math.max(20, width - 5);
            setWidth(newWidth);
          }
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyResize);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyResize);
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [selectedNode, onNodeSelection, width]);

  if (!selectedNode || !data || !data.links) return null;

  const handleMouseDown = (e) => {
    isDragging.current = true;
    e.preventDefault();
    
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
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

  // Get related connections
  const relatedLinks = data.links.filter(
    link => link.source === selectedNode.id || link.target === selectedNode.id
  );

  return (
    <div 
      className={`
        fixed bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col
        
        md:right-0 md:top-0 md:h-full
        
        inset-0 md:inset-auto
      `}
      style={{ width: window.innerWidth > 768 ? `${width}%` : '100%' }}
      role="complementary"
      aria-labelledby="details-title"
      ref={detailsRef}
      tabIndex={-1}
    >
      {/* Mobile top navigation bar */}
      <div className="flex items-center p-4 border-b bg-gray-50 md:hidden">
        <button
          onClick={() => onNodeSelection(null)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          aria-label="Close details and return to main view"
        >
          <span className="text-lg">←</span>
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">{selectedNode.name}</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Desktop panel header */}
      <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div 
            className="w-6 h-6 rounded-full mr-3 flex-shrink-0"
            style={{ backgroundColor: getNodeColor(selectedNode.type) }}
          ></div>
          <div>
            <h2 id="details-title" className="text-2xl font-bold text-gray-900">{selectedNode.name}</h2>
            <div className="flex items-center gap-4">
              <p className="text-base text-gray-500 font-medium">{selectedNode.type}</p>
              <p className="text-sm text-gray-600">
                Use Ctrl/Cmd + ← → to resize panel
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNodeSelection(null)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Close details panel"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* People node fields */}
          {selectedNode.type === 'People' && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Bio</h3>
                {Array.isArray(selectedNode.bio) ? (
                  <div className="space-y-4">
                    {selectedNode.bio.map((paragraph, index) => (
                      <p key={index} className="text-base text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed">{selectedNode.bio || '/'}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Connections to institution</h3>
                <div className="text-base p-4 rounded-lg border" style={{ backgroundColor: '#F4F3F8', borderColor: '#5F5BA3', color: '#5F5BA3' }}>
                  {selectedNode.connections || '/'}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Website</h3>
                {(() => {
                  // Convert to array for consistent handling
                  const websiteArray = Array.isArray(selectedNode.websites) 
                    ? selectedNode.websites 
                    : selectedNode.website && selectedNode.website !== '/' ? [selectedNode.website] : [];
                  
                  return websiteArray.length > 0 ? (
                    <div className="space-y-2">
                      {websiteArray.map((website, index) => (
                        <a
                          key={index}
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-base p-3 rounded-lg border font-medium transition-colors hover:opacity-90 w-full"
                          style={{ 
                            backgroundColor: '#F4F3F8', 
                            borderColor: '#5F5BA3',
                            color: '#5F5BA3'
                          }}
                          aria-label={`Visit website ${index + 1} (opens in new tab)`}
                        >
                          <span className="flex-1 text-left truncate">{website}</span>
                          <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-base text-gray-700">/</div>
                  );
                })()}
              </div>

              {selectedNode.social && selectedNode.social.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Social</h3>
                  <div className="space-y-2">
                    {selectedNode.social.map((socialLink, index) => (
                      <a
                        key={index}
                        href={socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-base p-3 rounded-lg border font-medium transition-colors hover:opacity-90 w-full"
                        style={{ 
                          backgroundColor: '#F4F3F8', 
                          borderColor: '#5F5BA3',
                          color: '#5F5BA3'
                        }}
                        aria-label={`Visit social media profile ${index + 1} (opens in new tab)`}
                      >
                        <span className="flex-1 text-left truncate">{socialLink}</span>
                        <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Partners node fields */}
          {selectedNode.type === 'Partners' && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Bio</h3>
                {Array.isArray(selectedNode.bio) ? (
                  <div className="space-y-4">
                    {selectedNode.bio.map((paragraph, index) => (
                      <p key={index} className="text-base text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed">{selectedNode.bio || '/'}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Website</h3>
                {(() => {
                  // Support both websites array and single website
                  const websites = selectedNode.websites || (selectedNode.website ? [selectedNode.website] : []);
                  
                  if (websites.length > 0 && websites.some(site => site !== '/')) {
                    const validWebsites = websites.filter(site => site !== '/');
                    
                    if (validWebsites.length === 1) {
                      // Single website - use original style
                      return (
                        <a
                          href={validWebsites[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-base p-4 rounded-lg border font-medium transition-colors hover:opacity-90"
                          style={{ 
                            backgroundColor: '#FFF6FB', 
                            borderColor: '#DC2680',
                            color: '#DC2680'
                          }}
                          aria-label={`Visit institution website (opens in new tab)`}
                        >
                          Visit Website <ExternalLink size={16} className="ml-2" />
                        </a>
                      );
                    } else {
                      // Multiple websites - use list style
                      return (
                        <div className="space-y-2">
                          {validWebsites.map((website, index) => (
                            <a
                              key={index}
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-base p-3 rounded-lg border font-medium transition-colors hover:opacity-90 w-full"
                              style={{ 
                                backgroundColor: '#FFF6FB', 
                                borderColor: '#DC2680',
                                color: '#DC2680'
                              }}
                              aria-label={`Visit website ${index + 1} (opens in new tab)`}
                            >
                              <span className="flex-1 text-left truncate">{website}</span>
                              <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      );
                    }
                  } else {
                    return <div className="text-base text-gray-700">/</div>;
                  }
                })()}
              </div>
              
              {selectedNode.social && selectedNode.social.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Social</h3>
                  <div className="space-y-2">
                    {selectedNode.social.map((socialLink, index) => (
                      <a
                        key={index}
                        href={socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-base p-3 rounded-lg border font-medium transition-colors hover:opacity-90 w-full"
                        style={{ 
                          backgroundColor: '#FFF6FB', 
                          borderColor: '#DC2680',
                          color: '#DC2680'
                        }}
                        aria-label={`Visit social media profile ${index + 1} (opens in new tab)`}
                      >
                        <span className="flex-1 text-left truncate">{socialLink}</span>
                        <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedNode.type === 'Projects' && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Description</h3>
                {Array.isArray(selectedNode.description) ? (
                  <div className="space-y-4">
                    {selectedNode.description.map((paragraph, index) => (
                      <p key={index} className="text-base text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed">{selectedNode.description || '/'}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Who was involved</h3>
                <p className="text-base text-gray-700 leading-relaxed field-content">{selectedNode.who_involved || '/'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Legacy / Impacts</h3>
                <div className="text-base text-gray-700 leading-relaxed field-content">
                  {selectedNode.legacy_impacts && selectedNode.legacy_impacts !== '/' ? 
                    renderFormattedText(selectedNode.legacy_impacts, 'legacy') : 
                    '/'
                  }
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Challenges the project faced</h3>
                <div className="text-base text-gray-700 leading-relaxed field-content">
                  {selectedNode.challenges && selectedNode.challenges !== '/' ? 
                    renderFormattedText(selectedNode.challenges, 'project_challenges') : 
                    '/'
                  }
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">What kind of budget was it?</h3>
                {selectedNode.budget ? (
                  <span className="inline-block px-4 py-2 text-base rounded-full font-medium" style={{ backgroundColor: '#FFFAF3', color: '#EB631A' }}>
                    {selectedNode.budget}
                  </span>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">What methods were used?</h3>
                <p className="text-base text-gray-700 leading-relaxed">{selectedNode.methods || '/'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Website / Links to videos</h3>
                {(() => {
                  // Convert to array for consistent handling
                  const websiteArray = Array.isArray(selectedNode.website) 
                    ? selectedNode.website 
                    : selectedNode.website && selectedNode.website !== '/' ? [selectedNode.website] : [];
                  
                  return websiteArray.length > 0 ? (
                    <div className="space-y-2">
                      {websiteArray.map((link, index) => {
                        // Support both formats: object with title or plain URL string
                        const url = typeof link === 'string' ? link : link.url;
                        const title = typeof link === 'string' ? link : link.title;
                        
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-base p-3 rounded-lg border font-medium transition-colors hover:opacity-90 w-full"
                            style={{ 
                              backgroundColor: '#FFFAF3', 
                              borderColor: '#EB631A',
                              color: '#EB631A'
                            }}
                            aria-label={`${title} (opens in new tab)`}
                          >
                            <span className="flex-1 text-left truncate">{title}</span>
                            <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-base text-gray-700">/</div>
                  );
                })()}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Who was involved (Partners)</h3>
                <p className="text-base text-gray-700 leading-relaxed field-content">
                  {selectedNode.involved_institutions || '/'}
                </p>
              </div>
            </>
          )}

          {selectedNode.type === 'Methods' && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Description</h3>
                {Array.isArray(selectedNode.description) ? (
                  <div className="space-y-4">
                    {selectedNode.description.map((paragraph, index) => (
                      <p key={index} className="text-base text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed">{selectedNode.description || '/'}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Step-by-step guide</h3>
                {selectedNode.steps ? (
                  <div className="text-base text-gray-700 field-content bg-gray-50 p-4 rounded-lg border">
                    {renderFormattedText(selectedNode.steps, 'steps')}
                  </div>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Challenges of this method</h3>
                {selectedNode.challenges && selectedNode.challenges !== '/' ? (
                  <div className="text-base text-gray-700 leading-relaxed field-content">
                    {renderFormattedText(selectedNode.challenges, 'challenges')}
                  </div>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">What conditions / materials are needed?</h3>
                {selectedNode.conditions && selectedNode.conditions !== '/' ? (
                  <div className="text-base text-gray-700 leading-relaxed field-content">
                    {renderFormattedText(selectedNode.conditions, 'conditions')}
                  </div>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Links to reports / publications</h3>
                {selectedNode.publications && selectedNode.publications !== '/' ? (
                  Array.isArray(selectedNode.publications) ? (
                    <div className="space-y-3">
                      {selectedNode.publications.map((pub, index) => (
                        <div key={index} className="text-base text-gray-700 leading-relaxed field-content flex items-start">
                          <span className="text-green-600 mr-2 mt-1">•</span>
                          <span className="flex-1">{renderTextWithLinks(pub)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-base text-gray-700 leading-relaxed field-content">
                      {renderFormattedText(selectedNode.publications, 'conditions')}
                    </div>
                  )
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Downloadable Templates you might need</h3>
                {selectedNode.templates && selectedNode.templates !== '/' ? (
                  <div className="text-base text-gray-700 leading-relaxed field-content">
                    {renderFormattedText(selectedNode.templates, 'conditions')}
                  </div>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Category</h3>
                {selectedNode.category && selectedNode.category !== '/' ? (
                  <span className="inline-block px-4 py-2 text-base rounded-full font-medium" style={{ backgroundColor: '#EEF9F6', color: '#148D66' }}>
                    {selectedNode.category}
                  </span>
                ) : (
                  <div className="text-base text-gray-700">/</div>
                )}
              </div>
            </>
          )}

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 text-lg">Connected Entities</h3>
            <div className="space-y-3">
              {relatedLinks.map((link, index) => {
                const connectedNodeId = link.source === selectedNode.id ? link.target : link.source;
                const connectedNode = data.nodes.find(n => n.id === connectedNodeId);
                if (!connectedNode) return null;
                return (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors cursor-pointer"
                       onClick={() => onNodeSelection(connectedNode)}>
                    <div 
                      className="w-4 h-4 rounded-full mr-4 flex-shrink-0"
                      style={{ backgroundColor: getNodeColor(connectedNode.type) }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base text-gray-900 truncate">
                        {connectedNode.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {connectedNode.type}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Left drag handle */}
      <div 
        className="absolute left-0 top-0 w-1 h-full bg-gray-300 cursor-col-resize transition-colors"
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#00837F'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#d1d5db'}
        title="Drag to resize"
      />
    </div>
  );
};

export default NodeDetails;