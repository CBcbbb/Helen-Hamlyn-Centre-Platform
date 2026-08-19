import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GraphView from './GraphView';

// jsdom lacks the SVG geometry methods (getScreenCTM, etc.) that d3-zoom's
// setup relies on, so the D3 force-simulation effect is mocked out here.
// These tests only exercise the mobile filter dialog, not the graph itself.
jest.mock('d3', () => {
  // Any method call/property access returns the same chainable stub, so
  // GraphView's D3 setup effect (select().selectAll().remove()... etc.) can
  // run to completion without touching real SVG geometry.
  const chainable = new Proxy(
    () => chainable,
    {
      get: (target, prop) => {
        if (prop === 'then' || typeof prop === 'symbol') return undefined;
        if (prop === 'node') return () => ({ getComputedTextLength: () => 0 });
        return () => chainable;
      },
    }
  );

  return {
    __esModule: true,
    select: () => chainable,
    zoomIdentity: { scale: () => chainable },
    zoom: () => chainable,
    drag: () => chainable,
    forceSimulation: () => chainable,
    forceLink: () => chainable,
    forceManyBody: () => chainable,
    forceCenter: () => chainable,
    forceCollide: () => chainable,
  };
});

const data = {
  nodes: [
    { id: 'p1', type: 'People', name: 'Ada' },
    { id: 'm1', type: 'Methods', name: 'Interviews' },
  ],
  links: [],
};
const visibleTypes = { People: true, Partners: true, Projects: true, Methods: true };

const renderGraphView = () =>
  render(
    <GraphView
      data={data}
      visibleTypes={visibleTypes}
      toggleNodeType={() => {}}
      highlightedNodes={new Set()}
      selectedNode={null}
      onNodeSelection={() => {}}
      zoomLevel={0.5}
      setZoomLevel={() => {}}
    />
  );

test('mobile filter dialog has dialog semantics and closes on Escape', async () => {
  renderGraphView();

  const trigger = screen.getByRole('button', { name: 'Open filters' });
  fireEvent.click(trigger);

  const dialog = await screen.findByRole('dialog', { name: /Filters/i });
  expect(dialog).toHaveAttribute('aria-modal', 'true');

  await waitFor(() => expect(dialog).toHaveFocus());

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('focus returns to the "Open filters" trigger after the dialog closes', async () => {
  renderGraphView();

  const trigger = screen.getByRole('button', { name: 'Open filters' });
  trigger.focus();
  fireEvent.click(trigger);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  fireEvent.keyDown(document, { key: 'Escape' });

  await waitFor(() => expect(trigger).toHaveFocus());
});

test('clicking the backdrop closes the dialog', async () => {
  const { container } = renderGraphView();

  fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
  await screen.findByRole('dialog');

  const backdrop = container.querySelector('.bg-black');
  fireEvent.click(backdrop);

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('Zoom In and Zoom Out buttons have accessible names independent of their title/icon', () => {
  renderGraphView();

  expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
});

// A minimal matchMedia stub whose "matches" can be flipped from the test and
// whose "change" listeners fire manually — same shape as useMediaQuery.test.js,
// used here to drive GraphView between mobile and wide-layout modes.
const mockMatchMedia = (initialMatches) => {
  let matches = initialMatches;
  const listeners = new Set();
  window.matchMedia = (query) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (event, cb) => {
      if (event === 'change') listeners.add(cb);
    },
    removeEventListener: (event, cb) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
  return {
    setMatches: (value) => {
      matches = value;
      listeners.forEach((cb) => cb({ matches: value }));
    },
  };
};

const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test('no mobile filter dialog is rendered in wide-layout mode, even if opened', async () => {
  mockMatchMedia(true);
  renderGraphView();

  fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('entering wide-layout mode while the mobile dialog is open auto-closes it', async () => {
  const { setMatches } = mockMatchMedia(false);
  renderGraphView();

  fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
  await screen.findByRole('dialog');

  act(() => setMatches(true));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
