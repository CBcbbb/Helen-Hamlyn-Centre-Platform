import { renderHook, act } from '@testing-library/react';
import useMediaQuery, { WIDE_LAYOUT_QUERY } from './useMediaQuery';

// A minimal matchMedia stub whose "matches" value can be flipped from the
// test and whose registered "change" listeners fire manually, so tests can
// simulate a real browser responding to a viewport/media change without
// touching window.innerWidth.
const mockMatchMedia = (initialMatches) => {
  let matches = initialMatches;
  const listeners = new Set();

  const mql = {
    get matches() {
      return matches;
    },
    media: '',
    addEventListener: (event, cb) => {
      if (event === 'change') listeners.add(cb);
    },
    removeEventListener: (event, cb) => {
      listeners.delete(cb);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };

  window.matchMedia = (query) => {
    mql.media = query;
    return mql;
  };

  return {
    // Mutates the MediaQueryList's `matches` and notifies its "change"
    // listeners, like a real browser reacting to the query flipping.
    setMatches: (value) => {
      matches = value;
      listeners.forEach((cb) => cb({ matches: value }));
    },
    // Mutates `matches` without notifying "change" listeners, so tests can
    // simulate an environment where only a plain "resize" event fires.
    setMatchesSilently: (value) => {
      matches = value;
    },
    mql,
  };
};

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test('returns the initial match state', () => {
  mockMatchMedia(true);
  const { result } = renderHook(() => useMediaQuery(WIDE_LAYOUT_QUERY));
  expect(result.current).toBe(true);
});

test('updates when the MediaQueryList fires a change event', () => {
  const { setMatches } = mockMatchMedia(false);
  const { result } = renderHook(() => useMediaQuery(WIDE_LAYOUT_QUERY));
  expect(result.current).toBe(false);

  act(() => setMatches(true));
  expect(result.current).toBe(true);

  act(() => setMatches(false));
  expect(result.current).toBe(false);
});

test('updates on a plain window resize even without a change event', () => {
  const { setMatchesSilently } = mockMatchMedia(false);
  const { result } = renderHook(() => useMediaQuery(WIDE_LAYOUT_QUERY));
  expect(result.current).toBe(false);

  // Simulate an environment (e.g. devtools viewport override) that resizes
  // without firing the MediaQueryList's own "change" event: flip matches
  // directly, then dispatch a plain resize.
  setMatchesSilently(true);
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });

  expect(result.current).toBe(true);
});
