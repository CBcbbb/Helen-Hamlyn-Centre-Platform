// Node type + color configuration — single source of truth.
// Values live in src/globals.css; adding or retinting a type means editing
// the --color-<type> custom properties there AND the mapping below (see CLAUDE.md).

const cssVar = (name) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!value && process.env.NODE_ENV !== 'production') {
    console.warn(`[graphUtils] CSS custom property ${name} is not defined in globals.css`);
  }
  return value;
};

// The canonical, ordered list of node types.
export const NODE_TYPES = ['People', 'Partners', 'Projects', 'Methods'];

// Per-type palette: base swatch, light tint background, darker hover shade, ring border.
export const NODE_TYPE_STYLES = {
  People:   { color: cssVar('--color-people'),   tint: cssVar('--color-people-tint'),   hover: cssVar('--color-people-hover'),   ring: cssVar('--color-people-ring') },
  Partners: { color: cssVar('--color-partners'), tint: cssVar('--color-partners-tint'), hover: cssVar('--color-partners-hover'), ring: cssVar('--color-partners-ring') },
  Projects: { color: cssVar('--color-projects'), tint: cssVar('--color-projects-tint'), hover: cssVar('--color-projects-hover'), ring: cssVar('--color-projects-ring') },
  Methods:  { color: cssVar('--color-methods'),  tint: cssVar('--color-methods-tint'),  hover: cssVar('--color-methods-hover'),  ring: cssVar('--color-methods-ring') },
};
export const DEFAULT_NODE_COLOR = cssVar('--color-node-default');

// Brand accent (teal) used across UI chrome + search-highlight colors.
export const ACCENT = cssVar('--color-accent');
export const ACCENT_HOVER = cssVar('--color-accent-hover');
export const HIGHLIGHT_BG = cssVar('--color-highlight-bg');

// Auto-linked text color inside node detail bodies (all node types).
export const LINK_COLOR = cssVar('--color-link');

// Neutral UI chrome shared across admin/detail panels.
export const BORDER_MUTED = cssVar('--color-border-muted');
export const BTN_NEUTRAL = cssVar('--color-btn-neutral');
export const BTN_NEUTRAL_HOVER = cssVar('--color-btn-neutral-hover');
export const BTN_DISABLED = cssVar('--color-btn-disabled');
export const BTN_SUBTLE_HOVER = cssVar('--color-btn-subtle-hover');

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