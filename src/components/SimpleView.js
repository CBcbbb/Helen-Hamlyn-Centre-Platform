import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getNodeColor, getNodeTint, getNodeRing, ACCENT, HIGHLIGHT_BG, NODE_TYPES } from '../utils/graphUtils';

const truncate = (text, length) => {
  const value = Array.isArray(text) ? text[0] : text;
  if (!value) return null;
  return value.length > length ? `${value.substring(0, length)}...` : value;
};

// Per-type supplementary content shown under the entity name. Kept local to
// SimpleView (not graphUtils) since it's purely presentational and specific
// to this list layout.
const EXTRA_CONTENT_BY_TYPE = {
  People: (node) => (
    <>
      {node.connections && (
        <div className="text-sm mt-1 line-clamp-2" style={{ color: getNodeColor('People') }}>
          {node.connections}
        </div>
      )}
      <div className="text-sm text-gray-400 mt-1 truncate">{truncate(node.bio, 80)}</div>
    </>
  ),
  Partners: (node) => (
    <>
      {node.bio && (
        <div className="text-sm text-gray-400 mt-1 truncate">{truncate(node.bio, 100)}</div>
      )}
      {node.website && (
        <div className="text-sm mt-1 flex items-center" style={{ color: getNodeColor('Partners') }}>
          <ExternalLink size={10} className="mr-1" aria-hidden="true" />
          Website
        </div>
      )}
    </>
  ),
  Projects: (node) => (
    node.description && (
      <div className="text-sm text-gray-400 mt-1 line-clamp-2">{truncate(node.description, 100)}</div>
    )
  ),
  Methods: (node) => (
    <>
      {node.category && (
        <div
          className="text-sm text-white mt-1 inline-block px-2 py-1 rounded"
          style={{ backgroundColor: getNodeColor('Methods') }}
        >
          {node.category}
        </div>
      )}
      {node.description && (
        <div className="text-sm text-gray-400 mt-2 line-clamp-2">{truncate(node.description, 100)}</div>
      )}
    </>
  ),
};

const SimpleView = ({ data, visibleTypes, highlightedNodes, onNodeSelection }) => {
  if (!data || !data.nodes) return null;

  return (
    <section className="p-6 overflow-auto h-full" aria-labelledby="simpleview-heading">
      <div className="bg-white rounded-lg shadow border">
        <div className="sr-only">
          <h2 id="simpleview-heading">Helen Hamlyn Centre for Design - Entities List</h2>
          <p>
            List showing {data.nodes.length} entities organized by type: People, Partners, Projects, and Methods.
            Each entity can be selected to view detailed information.
          </p>
        </div>

        <div className="grid gap-4 p-4 md:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {NODE_TYPES.map(type => {
            const nodes = data.nodes.filter(n => n.type === type && visibleTypes[type]);
            const renderExtra = EXTRA_CONTENT_BY_TYPE[type];

            return (
              <section key={type} aria-labelledby={`simpleview-${type}-heading`}>
                <h3 id={`simpleview-${type}-heading`} className="font-semibold text-base text-gray-700 mb-3 flex items-center">
                  <span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: getNodeColor(type) }} aria-hidden="true"></span>
                  {type} ({nodes.length})
                </h3>
                <ul className="space-y-3 list-none p-0 m-0">
                  {nodes.map((node, index) => (
                    <li key={node.id}>
                      <button
                        onClick={() => onNodeSelection(node)}
                        className={`w-full text-left p-3 rounded border transition-all hover:shadow-md focus-ring-brand ${
                          highlightedNodes.has(node.id) ? 'shadow-md' : 'hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: highlightedNodes.has(node.id) ? HIGHLIGHT_BG : getNodeTint(type),
                          borderColor: highlightedNodes.has(node.id) ? ACCENT : getNodeRing(type)
                        }}
                      >
                        <div className="font-medium text-base text-gray-900">
                          {node.name}
                          <span className="sr-only"> ({index + 1} of {nodes.length})</span>
                        </div>
                        {renderExtra && renderExtra(node)}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SimpleView;
