// Node type + color configuration — single source of truth.
// Adding or retinting a type happens here only (see CLAUDE.md).

// The canonical, ordered list of node types.
export const NODE_TYPES = ['People', 'Partners', 'Projects', 'Methods'];

// Per-type palette: base swatch, light tint background, darker hover shade.
export const NODE_TYPE_STYLES = {
  People:   { color: '#5F5BA3', tint: '#F4F3F8', hover: '#4a4782' },
  Partners: { color: '#DC2680', tint: '#FFF6FB', hover: '#b01e68' },
  Projects: { color: '#EB631A', tint: '#FFFAF3', hover: '#c94f15' },
  Methods:  { color: '#148D66', tint: '#EEF9F6', hover: '#107052' },
};
export const DEFAULT_NODE_COLOR = '#999';

// Brand accent (teal) used across UI chrome + search-highlight colors.
export const ACCENT = '#00837F';
export const HIGHLIGHT_BG = '#F6FFFF';

export const getNodeColor = (type) => NODE_TYPE_STYLES[type]?.color ?? DEFAULT_NODE_COLOR;
export const getNodeTint = (type) => NODE_TYPE_STYLES[type]?.tint ?? '#f9fafb';
export const getNodeHover = (type) => NODE_TYPE_STYLES[type]?.hover ?? '#666';

export const getFilteredData = (data, visibleTypes) => {
  const filteredNodes = data.nodes.filter(node => visibleTypes[node.type]);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = data.links.filter(link => 
    filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
  );
  
  return { nodes: filteredNodes, links: filteredLinks };
};

export const searchNodes = (data, term) => {
  if (term.trim() === '') {
    return new Set();
  }
  
  const matches = new Set();
  data.nodes.forEach(node => {
    const lowerTerm = term.toLowerCase();
    
    // Check name
    if (node.name.toLowerCase().includes(lowerTerm)) {
      matches.add(node.id);
      return;
    }
    
    // Check bio (can be string or array)
    if (node.bio) {
      const bioText = Array.isArray(node.bio) ? node.bio.join(' ') : node.bio;
      if (bioText.toLowerCase().includes(lowerTerm)) {
        matches.add(node.id);
        return;
      }
    }
    
    // Check description (can be string or array)
    if (node.description) {
      const descText = Array.isArray(node.description) ? node.description.join(' ') : node.description;
      if (descText.toLowerCase().includes(lowerTerm)) {
        matches.add(node.id);
        return;
      }
    }
    
    // Check methods
    if (node.methods && node.methods.toLowerCase().includes(lowerTerm)) {
      matches.add(node.id);
      return;
    }
    
    // Check category
    if (node.category && node.category.toLowerCase().includes(lowerTerm)) {
      matches.add(node.id);
      return;
    }
  });
  
  return matches;
};