import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getNodeColor, getNodeTint, ACCENT, HIGHLIGHT_BG, NODE_TYPES } from '../utils/graphUtils';

const SimpleView = ({ data, visibleTypes, highlightedNodes, onNodeSelection }) => {
  if (!data || !data.nodes) return null;

  return (
    <div className="p-6 overflow-auto h-full" role="main" aria-label="Accessible table view of network data">
      <div className="bg-white rounded-lg shadow border">
        {/* Table description for screen reader users */}
        <div className="sr-only">
          <h2>Helen Hamlyn Centre for Design - Entities Table</h2>
          <p>
            Table showing {data.nodes.length} entities organized by type: People, Partners, Projects, and Methods.
            Each entity can be selected to view detailed information.
          </p>
        </div>
        
        <div 
          className={`
            grid gap-4 p-4 bg-gray-50 font-semibold text-base text-gray-700 rounded-t-lg border-b
            
            grid-cols-1
            
            sm:grid-cols-2
            
            lg:grid-cols-4
          `}
          role="row"
        >
          {NODE_TYPES.map(type => (
            <div key={type} className="flex items-center" role="columnheader">
              <div className="w-4 h-4 rounded mr-2" style={{backgroundColor: getNodeColor(type)}} aria-hidden="true"></div>
              {type} ({data.nodes.filter(n => n.type === type && visibleTypes[type]).length})
            </div>
          ))}
        </div>
        
        <div 
          className={`
            grid gap-4 p-4
            
            grid-cols-1
            
            sm:grid-cols-2
            
            lg:grid-cols-4
          `}
          role="grid"
          aria-label="Entities organized by type"
        >
          <div role="gridcell" aria-label="People entities">
            <h3 className="sr-only">People</h3>
            <div className="space-y-3">
            {data.nodes.filter(n => n.type === 'People' && visibleTypes.People).map((node, index) => (
              <button
                key={node.id}
                onClick={() => onNodeSelection(node)}
                className={`w-full text-left p-3 rounded border transition-all hover:shadow-md focus-ring-brand ${
                  highlightedNodes.has(node.id) ? 'shadow-md' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: highlightedNodes.has(node.id) ? HIGHLIGHT_BG : getNodeTint('People'),
                  borderColor: highlightedNodes.has(node.id) ? ACCENT : 'rgba(95, 91, 163, 0.5)'
                }}
                aria-label={`View details for ${node.name}, person ${index + 1} of ${data.nodes.filter(n => n.type === 'People' && visibleTypes.People).length}`}
                {...(node.connections && { 'aria-describedby': `node-${node.id}-summary` })}
              >
                <div className="font-medium text-base text-gray-900">{node.name}</div>
                {node.connections && (
                  <div id={`node-${node.id}-summary`} className="text-sm mt-1 line-clamp-2" style={{ color: getNodeColor('People') }}>{node.connections}</div>
                )}
                <div className="text-sm text-gray-400 mt-1 truncate">
                  {Array.isArray(node.bio) 
                    ? node.bio[0]?.substring(0, 80) + '...'
                    : node.bio?.substring(0, 80) + '...'
                  }
                </div>
              </button>
            ))}
            </div>
          </div>

          <div role="gridcell" aria-label="Partners entities">
            <h3 className="sr-only">Partners</h3>
            <div className="space-y-3">
            {data.nodes.filter(n => n.type === 'Partners' && visibleTypes.Partners).map((node, index) => (
              <button
                key={node.id}
                onClick={() => onNodeSelection(node)}
                className={`w-full text-left p-3 rounded border transition-all hover:shadow-md focus-ring-brand ${
                  highlightedNodes.has(node.id) ? 'shadow-md' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: highlightedNodes.has(node.id) ? HIGHLIGHT_BG : getNodeTint('Partners'),
                  borderColor: highlightedNodes.has(node.id) ? ACCENT : 'rgba(220, 38, 128, 0.5)'
                }}
                aria-label={`View details for ${node.name}, partner ${index + 1} of ${data.nodes.filter(n => n.type === 'Partners' && visibleTypes.Partners).length}`}
                {...(node.bio && { 'aria-describedby': `node-${node.id}-summary` })}
              >
                <div className="font-medium text-base text-gray-900">{node.name}</div>
                {node.bio && (
                  <div id={`node-${node.id}-summary`} className="text-sm text-gray-400 mt-1 truncate">
                    {Array.isArray(node.bio) 
                      ? node.bio[0]?.substring(0, 100) + '...'
                      : node.bio?.substring(0, 100) + '...'
                    }
                  </div>
                )}
                {node.website && (
                  <div className="text-sm mt-1 flex items-center" style={{ color: getNodeColor('Partners') }}>
                    <ExternalLink size={10} className="mr-1" aria-hidden="true" />
                    Website
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>

          <div role="gridcell" aria-label="Projects entities">
            <h3 className="sr-only">Projects</h3>
            <div className="space-y-3">
            {data.nodes.filter(n => n.type === 'Projects' && visibleTypes.Projects).map((node, index) => (
              <button
                key={node.id}
                onClick={() => onNodeSelection(node)}
                className={`w-full text-left p-3 rounded border transition-all hover:shadow-md focus-ring-brand ${
                  highlightedNodes.has(node.id) ? 'shadow-md' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: highlightedNodes.has(node.id) ? HIGHLIGHT_BG : getNodeTint('Projects'),
                  borderColor: highlightedNodes.has(node.id) ? ACCENT : 'rgba(235, 98, 26, 0.5)'
                }}
                aria-label={`View details for ${node.name}, project ${index + 1} of ${data.nodes.filter(n => n.type === 'Projects' && visibleTypes.Projects).length}`}
                {...(node.description && { 'aria-describedby': `node-${node.id}-summary` })}
              >
                <div className="font-medium text-base text-gray-900">{node.name}</div>
                {node.description && (
                  <div id={`node-${node.id}-summary`} className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {Array.isArray(node.description) 
                      ? node.description[0]?.substring(0, 100) + '...'
                      : node.description?.substring(0, 100) + '...'
                    }
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>

          <div role="gridcell" aria-label="Methods entities">
            <h3 className="sr-only">Methods</h3>
            <div className="space-y-3">
            {data.nodes.filter(n => n.type === 'Methods' && visibleTypes.Methods).map((node, index) => (
              <button
                key={node.id}
                onClick={() => onNodeSelection(node)}
                className={`w-full text-left p-3 rounded border transition-all hover:shadow-md focus-ring-brand ${
                  highlightedNodes.has(node.id) ? 'shadow-md' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: highlightedNodes.has(node.id) ? HIGHLIGHT_BG : getNodeTint('Methods'),
                  borderColor: highlightedNodes.has(node.id) ? ACCENT : 'rgba(20, 141, 102, 0.5)'
                }}
                aria-label={`View details for ${node.name}, method ${index + 1} of ${data.nodes.filter(n => n.type === 'Methods' && visibleTypes.Methods).length}`}
                {...(node.description && { 'aria-describedby': `node-${node.id}-summary` })}
              >
                <div className="font-medium text-base text-gray-900">{node.name}</div>
                {node.category && (
                  <div className="text-sm text-white mt-1 inline-block px-2 py-1 rounded" style={{ backgroundColor: getNodeColor('Methods') }}>
                    {node.category}
                  </div>
                )}
                {node.description && (
                  <div id={`node-${node.id}-summary`} className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {Array.isArray(node.description) 
                      ? node.description[0]?.substring(0, 100) + '...'
                      : node.description?.substring(0, 100) + '...'
                    }
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleView;