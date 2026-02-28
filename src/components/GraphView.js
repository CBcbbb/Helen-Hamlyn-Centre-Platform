import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Filter, X } from 'lucide-react';
import { getNodeColor, getFilteredData } from '../utils/graphUtils';

const GraphView = ({ 
  data, 
  visibleTypes, 
  toggleNodeType, 
  highlightedNodes, 
  selectedNode, 
  onNodeSelection,
  zoomLevel,
  setZoomLevel
}) => {
  const svgRef = useRef();
  const simulationRef = useRef();
  const zoomRef = useRef();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Handle zoom
  const handleZoom = (direction) => {
    const svg = d3.select(svgRef.current);
    
    if (direction === 'in') {
      svg.transition().call(zoomRef.current.scaleBy, 1.5);
    } else {
      svg.transition().call(zoomRef.current.scaleBy, 0.67);
    }
  };

  // Text wrapping function for SVG
  const addTextWithWrapping = (textElement, text, maxWidth = 240, maxLines = 6) => {
    const words = text.split(/\s+/);
    const lineHeight = 1.2;
    let lines = [];
    let currentLine = [];

    // Test width word by word
    for (let i = 0; i < words.length; i++) {
      currentLine.push(words[i]);
      const testText = currentLine.join(' ');
      
      textElement.text(testText);
      const textWidth = textElement.node().getComputedTextLength();
      
      if (textWidth > maxWidth && currentLine.length > 1) {
        currentLine.pop();
        lines.push(currentLine.join(' '));
        currentLine = [words[i]];
        
        if (lines.length >= maxLines - 1) {
          currentLine.push('...');
          break;
        }
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    // Clear and rebuild text
    textElement.text('');
    
    // Calculate vertical center starting position
    const totalHeight = lines.length * lineHeight;
    const startY = -(totalHeight - 1) * 0.5;
    
    lines.forEach((line, index) => {
      textElement.append('tspan')
        .attr('x', 0)
        .attr('dy', index === 0 ? `${startY}em` : `${lineHeight}em`)
        .text(line);
    });
  };

  // Initialize D3 force-directed graph
  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    const currentData = getFilteredData(data, visibleTypes);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 1000;
    const height = svgRef.current.clientHeight || 700;
    
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Set initial zoom to 50% without animation
    svg.call(zoom.transform, d3.zoomIdentity.scale(0.5));

    // Ensure source and target in link data are object references
    const nodesMap = new Map(currentData.nodes.map(d => [d.id, d]));
    const processedLinks = currentData.links.map(link => ({
      ...link,
      source: typeof link.source === 'string' ? nodesMap.get(link.source) : link.source,
      target: typeof link.target === 'string' ? nodesMap.get(link.target) : link.target
    }));

    // Force-directed graph simulation
    const simulation = d3.forceSimulation(currentData.nodes)
      .force('link', d3.forceLink(processedLinks).id(d => d.id).distance(d => {
        switch (d.relationship) {
          case 'leads': return 150;
          case 'develops': return 180;
          case 'applies': return 200;
          case 'supports': return 220;
          default: return 180;
        }
      }))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2 + 120, height / 2))
      .force('collision', d3.forceCollide().radius(140));

    simulationRef.current = simulation;

    // Links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(processedLinks)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2);

    // Create node groups - text only, no background
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(currentData.nodes)
      .enter().append('g')
      .style('cursor', 'pointer')
      .style('filter', d => highlightedNodes.size > 0 && !highlightedNodes.has(d.id) ? 'opacity(0.3)' : 'none');

    // Add transparent interaction area for clicking and dragging
    nodeGroup.append('rect')
      .attr('width', 260)
      .attr('height', 180)
      .attr('x', -130)
      .attr('y', -90)
      .attr('fill', 'transparent')
      .attr('stroke', 'none');

    // Add colored text - the only visible element
    const nodeText = nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => getNodeColor(d.type))
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .style('font-size', '20px')
      .style('font-weight', '800')
      .style('line-height', '1.2')
      .style('pointer-events', 'none');

    // Add wrapped text for each node
    nodeText.each(function(d) {
      addTextWithWrapping(d3.select(this), d.name, 240, 6);
    });

    // Drag behavior
    const drag = d3.drag()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        event.sourceEvent.stopPropagation();
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag);

    // Click event
    nodeGroup.on('click', function(event, d) {
      event.stopPropagation();
      onNodeSelection(d);
    });

    // Mouse hover effect - scale text only
    nodeGroup
      .on('mouseenter', function(event, d) {
        // Scale up text
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('font-size', '24px')
          .style('font-weight', '900');
        
        // Highlight connected nodes and links
        const connectedNodes = new Set();
        processedLinks.forEach(l => {
          if (l.source.id === d.id) connectedNodes.add(l.target.id);
          if (l.target.id === d.id) connectedNodes.add(l.source.id);
        });
        
        g.selectAll('g.nodes > g')
          .style('opacity', n => n.id === d.id || connectedNodes.has(n.id) ? 1 : 0.3);
        g.selectAll('line')
          .style('opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.2);
      })
      .on('mouseleave', function(event, d) {
        // Restore original text size
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('font-size', '20px')
          .style('font-weight', '800');
        
        g.selectAll('g.nodes > g').style('opacity', 1);
        g.selectAll('line').style('opacity', 0.6);
      });

    // Tick function
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroup
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, visibleTypes, highlightedNodes, onNodeSelection, setZoomLevel]);

  return (
    <div className="w-full h-full relative">
      <svg 
        ref={svgRef} 
        className="w-full h-full bg-gradient-to-br from-gray-50 to-white"
        role="img"
        aria-label="Helen Hamlyn Centre for Design Network Visualization - Interactive network showing relationships between entities across people, institutions, projects, and methods"
      >
      </svg>
 
      {/* Desktop filter panel */}
      <div className="hidden md:block absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h2 className="font-semibold text-sm mb-3 flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          Filters
        </h2>
        <div className="space-y-3">
          {[
            { type: 'People', color: '#5F5BA3', count: data.nodes?.filter(n => n.type === 'People').length || 0 },
            { type: 'Institutions', color: '#DC2680', count: data.nodes?.filter(n => n.type === 'Institutions').length || 0 },
            { type: 'Projects', color: '#EB631A', count: data.nodes?.filter(n => n.type === 'Projects').length || 0 },
            { type: 'Methods', color: '#148D66', count: data.nodes?.filter(n => n.type === 'Methods').length || 0 }
          ].map(item => (
            <div 
              key={item.type} 
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              onClick={() => toggleNodeType(item.type)}
            >
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all`}
                style={{ 
                  backgroundColor: visibleTypes[item.type] ? item.color : 'white',
                  borderColor: visibleTypes[item.type] ? item.color : '#d1d5db'
                }}
              >
                {visibleTypes[item.type] && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-sm select-none ${visibleTypes[item.type] ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.type} ({item.count})
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div>• Drag text to explore</div>
            <div>• Hover for connections</div>
            <div>• Click for details</div>
            <div>• Check/uncheck to filter</div>
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <button
        className="md:hidden absolute bottom-24 left-4 bg-white rounded-full shadow-lg p-3 border"
        onClick={() => setIsMobileFilterOpen(true)}
        aria-label="Open filters"
      >
        <Filter size={20} className="text-gray-600" />
      </button>

      {/* Mobile filter full-screen modal */}
      {isMobileFilterOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center">
                <Filter size={20} className="mr-2 text-gray-500" />
                Filters
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close filters"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { type: 'People', color: '#5F5BA3', count: data.nodes?.filter(n => n.type === 'People').length || 0 },
                { type: 'Institutions', color: '#DC2680', count: data.nodes?.filter(n => n.type === 'Institutions').length || 0 },
                { type: 'Projects', color: '#EB631A', count: data.nodes?.filter(n => n.type === 'Projects').length || 0 },
                { type: 'Methods', color: '#148D66', count: data.nodes?.filter(n => n.type === 'Methods').length || 0 }
              ].map(item => (
                <div 
                  key={item.type} 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  onClick={() => toggleNodeType(item.type)}
                >
                  <div 
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-all`}
                    style={{ 
                      backgroundColor: visibleTypes[item.type] ? item.color : 'white',
                      borderColor: visibleTypes[item.type] ? item.color : '#d1d5db'
                    }}
                  >
                    {visibleTypes[item.type] && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-base select-none ${visibleTypes[item.type] ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.type} ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-20 right-4 flex flex-col gap-2">
        <button
          onClick={() => handleZoom('in')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border"
          title="Zoom In"
        >
          <ZoomIn size={20} className="text-gray-600" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border"
          title="Zoom Out"
        >
          <ZoomOut size={20} className="text-gray-600" />
        </button>
        <div className="text-xs text-center text-gray-500 mt-1 bg-white rounded px-2 py-1 shadow">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
};

export default GraphView;