import { render, screen } from '@testing-library/react';
import Toolbar from './Toolbar';

const baseProps = {
  searchTerm: '',
  setSearchTerm: () => {},
  viewMode: 'graph',
  onViewModeChange: () => {},
  onShowKeyboardHelp: () => {},
  isNavExpanded: false,
  setIsNavExpanded: () => {},
};

test('renders no status region when the search box is empty', () => {
  render(<Toolbar {...baseProps} highlightedNodes={new Set()} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('announces match count when there are results', () => {
  render(<Toolbar {...baseProps} searchTerm="ada" highlightedNodes={new Set(['p1'])} />);
  expect(screen.getByRole('status')).toHaveTextContent('Found 1 matching node');
});

test('announces zero results instead of staying silent', () => {
  render(<Toolbar {...baseProps} searchTerm="zzz" highlightedNodes={new Set()} />);
  expect(screen.getByRole('status')).toHaveTextContent('No matching nodes found');
});
