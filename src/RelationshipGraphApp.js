import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Toolbar from './components/Toolbar';
import GraphView from './components/GraphView';
import SimpleView from './components/SimpleView';
import NodeDetails from './components/NodeDetails';
import Modal from './components/Modal';
import KeyboardHelp from './components/KeyboardHelp';
import FundingBar from './components/FundingBar';
import { searchNodes } from './utils/graphUtils';

const RelationshipGraphApp = () => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'simple'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [showModal, setShowModal] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [announcements, setAnnouncements] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState({
    People: true,
    Institutions: true,
    Projects: true,
    Methods: true
  });

  // Handle node selection
  const handleNodeSelection = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/graphData.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'Helen Hamlyn Centre for Design Data Platform';
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      // Cmd/Ctrl + E: Toggle view mode
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.code === 'KeyE' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        handleViewModeChange(viewMode === 'graph' ? 'simple' : 'graph');
        setAnnouncements(`Switched to ${viewMode === 'graph' ? 'accessible table' : 'interactive map'} view`);
      }
      
      // Cmd/Ctrl + K: Focus search box
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.code === 'KeyK' || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[role="searchbox"]');
        if (searchInput) {
          searchInput.focus();
          setAnnouncements('Search box focused');
        }
      }
      
      // Cmd/Ctrl + B: Toggle navigation sidebar
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.code === 'KeyB' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setIsNavExpanded(!isNavExpanded);
        setAnnouncements(`Navigation ${!isNavExpanded ? 'expanded' : 'collapsed'}`);
      }
      
      // ? key: Show keyboard shortcuts help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [viewMode, handleViewModeChange, isNavExpanded, setAnnouncements]);

  // Handle search
  useEffect(() => {
    if (data) {
      const matches = searchNodes(data, searchTerm);
      setHighlightedNodes(matches);
    }
  }, [searchTerm, data]);

  // Toggle node type visibility
  const toggleNodeType = (type) => {
    setVisibleTypes(prev => {
      const newState = {
        ...prev,
        [type]: !prev[type]
      };
      // Add status announcement
      setAnnouncements(`${type} nodes ${newState[type] ? 'shown' : 'hidden'}`);
      return newState;
    });
  };

  // Loading state
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading data...</div>;
  }

  // Error state
  if (error) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Skip navigation link - only visible when focused */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView();
          }
        }}
      >
        Skip to main content
      </a>

      {/* Left navigation panel */}
      <aside role="navigation" aria-label="Main navigation">
        <Navigation 
          isNavExpanded={isNavExpanded} 
          setIsNavExpanded={setIsNavExpanded} 
          setShowModal={setShowModal}
          data={data}
        />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col" role="main">
        {/* Top toolbar */}
        <header role="banner">
          <Toolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            highlightedNodes={highlightedNodes}
            onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
            isNavExpanded={isNavExpanded}
            setIsNavExpanded={setIsNavExpanded}
          />
        </header>

        {/* Main view area */}
        <section id="main-content" className="flex-1 relative bg-white" tabIndex={-1} aria-label="Data visualization content">
          {viewMode === 'graph' ? (
            <GraphView 
              data={data}
              visibleTypes={visibleTypes}
              toggleNodeType={toggleNodeType}
              highlightedNodes={highlightedNodes}
              selectedNode={selectedNode}
              onNodeSelection={handleNodeSelection}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
            />
          ) : (
            <SimpleView 
              data={data}
              visibleTypes={visibleTypes}
              highlightedNodes={highlightedNodes}
              onNodeSelection={handleNodeSelection}
            />
          )}
        </section>
      </main>

      {/* Node details panel */}
      <NodeDetails 
        selectedNode={selectedNode} 
        onNodeSelection={handleNodeSelection}
        data={data}
      />

      {/* Navigation modal */}
      <Modal 
        showModal={showModal} 
        setShowModal={setShowModal} 
      />

      {/* Keyboard shortcuts help */}
      <KeyboardHelp 
        show={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />

      {/* Screen reader announcement area */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements}
      </div>

      {/* Funding acknowledgment bar */}
      <FundingBar />
    </div>
  );
};

export default RelationshipGraphApp;