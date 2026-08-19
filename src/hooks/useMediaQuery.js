import { useEffect, useState } from 'react';

// Shared "wide layout" breakpoint: at or above this width, the persistent
// (non-modal) desktop layouts apply — Navigation's persistent sidebar,
// GraphView's persistent filter panel, NodeDetails' complementary panel.
// Named by behavior, not by device, and matches Tailwind's `md:` breakpoint
// already used throughout the CSS for these same layouts. Components that
// genuinely need a different threshold may pass their own query string to
// useMediaQuery instead of this constant.
export const WIDE_LAYOUT_QUERY = '(min-width: 768px)';

// Subscribes to a matchMedia query and returns whether it currently matches.
// Re-evaluates on both the MediaQueryList's own "change" event and a plain
// window resize — some environments (e.g. devtools viewport overrides) resize
// the layout without firing "change" on the MediaQueryList, so falling back
// to "resize" keeps the value correct without needing a page refresh.
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    // The query string itself may have changed since the initial render.
    update();
    mql.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mql.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
