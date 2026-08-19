import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NodeDetails from './NodeDetails';

const data = {
  nodes: [
    { id: 'p1', type: 'People', name: 'Ada Lovelace', bio: 'A mathematician.' },
    { id: 'm1', type: 'Methods', name: 'Interviews', description: 'Talking to people.' },
  ],
  links: [{ source: 'p1', target: 'm1' }],
};

const selectedNode = data.nodes[0];

// A minimal matchMedia stub whose "matches" can be set up front (mode at
// mount) and flipped afterwards to simulate a viewport/layout change.
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

test('mobile (narrow) mode uses dialog semantics with aria-modal', async () => {
  mockMatchMedia(false);
  render(<NodeDetails selectedNode={selectedNode} onNodeSelection={() => {}} data={data} />);

  const dialog = await screen.findByRole('dialog', { name: 'Ada Lovelace' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
});

test('mobile Escape closes the panel', async () => {
  mockMatchMedia(false);
  const onNodeSelection = jest.fn();
  render(<NodeDetails selectedNode={selectedNode} onNodeSelection={onNodeSelection} data={data} />);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onNodeSelection).toHaveBeenCalledWith(null);
});

test('mobile: initial focus moves into the panel and returns to the trigger on close', async () => {
  mockMatchMedia(false);
  const trigger = document.createElement('button');
  trigger.textContent = 'Open Ada';
  document.body.appendChild(trigger);
  trigger.focus();

  const { rerender } = render(
    <NodeDetails selectedNode={selectedNode} onNodeSelection={() => {}} data={data} />
  );

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  rerender(<NodeDetails selectedNode={null} onNodeSelection={() => {}} data={data} />);

  await waitFor(() => expect(trigger).toHaveFocus());
  document.body.removeChild(trigger);
});

test('desktop (wide) mode uses complementary semantics with no aria-modal', async () => {
  mockMatchMedia(true);
  render(<NodeDetails selectedNode={selectedNode} onNodeSelection={() => {}} data={data} />);

  const panel = await screen.findByRole('complementary', { name: 'Ada Lovelace' });
  expect(panel).not.toHaveAttribute('aria-modal');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('switching from mobile to desktop mode leaves no stale modal dialog role', async () => {
  const { setMatches } = mockMatchMedia(false);
  render(<NodeDetails selectedNode={selectedNode} onNodeSelection={() => {}} data={data} />);

  await screen.findByRole('dialog', { name: 'Ada Lovelace' });

  act(() => setMatches(true));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });
});
