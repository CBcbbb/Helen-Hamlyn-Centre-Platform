import React from 'react';
import { Search, X, Eye, EyeOff, Menu } from 'lucide-react';

const Toolbar = ({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  onViewModeChange, 
  highlightedNodes,
  onShowKeyboardHelp,
  isNavExpanded,
  setIsNavExpanded
}) => {
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="bg-white shadow-sm border-b px-4 md:px-6 py-3">
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:items-center md:justify-between">
        {/* Title area and mobile menu button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              Knowledge Platform
            </h1>
          </div>
          {/* Mobile hamburger menu button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded transition-colors"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            aria-label={`${isNavExpanded ? 'Close' : 'Open'} navigation menu`}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search area */}
        <div className="w-full md:flex-1 md:flex md:justify-center">
          <div className="flex items-center w-full md:max-w-md">
            <Search size={20} className="text-gray-400 mr-3" aria-hidden="true" />
            <input
              type="text"
              role="searchbox"
              placeholder="Search nodes, descriptions, methods..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 outline-none text-base bg-gray-50 px-3 py-2 rounded border"
              aria-label="Search nodes, descriptions, and methods"
              aria-describedby={highlightedNodes.size > 0 ? "search-results" : undefined}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="ml-2 p-1 hover:bg-gray-100 rounded"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        
        {/* Button area */}
        <div className="flex items-center space-x-2 justify-center md:justify-end flex-shrink-0">
          <button
            onClick={() => onViewModeChange(viewMode === 'graph' ? 'simple' : 'graph')}
            className="flex items-center px-4 py-2 text-white rounded hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#00837F' }}
            aria-label={`Switch to ${viewMode === 'graph' ? 'accessible simple table' : 'interactive map'} view`}
          >
            {viewMode === 'graph' ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            <span className="ml-2 text-base">
              {viewMode === 'graph' ? 'Simple View' : 'Map View'}
            </span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-base"
            aria-label="Reset and refresh the application"
          >
            Reset
          </button>
          
          <button
            onClick={() => onShowKeyboardHelp && onShowKeyboardHelp()}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors text-base"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>

      {highlightedNodes.size > 0 && (
        <div 
          id="search-results"
          className="mt-2 text-center text-base" 
          style={{ color: '#00837F' }}
          role="status"
          aria-live="polite"
        >
          Found {highlightedNodes.size} matching node{highlightedNodes.size !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default Toolbar;