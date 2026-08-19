import { render, screen } from '@testing-library/react';
import SimpleView from './SimpleView';

const data = {
  nodes: [
    { id: 'p1', type: 'People', name: 'Ada Lovelace' },
    { id: 'pa1', type: 'Partners', name: 'Acme Institute' },
  ],
};
const visibleTypes = { People: true, Partners: true, Projects: true, Methods: true };

test('does not render a nested main landmark', () => {
  const { container } = render(
    <SimpleView data={data} visibleTypes={visibleTypes} highlightedNodes={new Set()} onNodeSelection={() => {}} />
  );
  expect(container.querySelector('[role="main"]')).not.toBeInTheDocument();
});

test('renders a heading with a visible count for each entity type', () => {
  render(<SimpleView data={data} visibleTypes={visibleTypes} highlightedNodes={new Set()} onNodeSelection={() => {}} />);
  expect(screen.getByRole('heading', { name: /People \(1\)/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Partners \(1\)/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Projects \(0\)/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Methods \(0\)/i })).toBeInTheDocument();
});

test('renders entities as list items with native buttons', () => {
  render(<SimpleView data={data} visibleTypes={visibleTypes} highlightedNodes={new Set()} onNodeSelection={() => {}} />);
  const button = screen.getByRole('button', { name: /Ada Lovelace/i });
  expect(button.closest('li')).toBeInTheDocument();
  expect(button.closest('ul')).toBeInTheDocument();
});
