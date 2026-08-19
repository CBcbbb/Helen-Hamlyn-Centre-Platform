import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
