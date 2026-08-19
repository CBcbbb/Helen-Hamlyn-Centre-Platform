import { render, screen, fireEvent } from '@testing-library/react';
import FilterItem from './FilterItem';

test('renders as a real checkbox with an accessible name including type and count', () => {
  render(<FilterItem type="People" color="#5F5BA3" count={12} checked={false} onToggle={() => {}} />);
  const checkbox = screen.getByRole('checkbox', { name: 'People (12)' });
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).not.toBeChecked();
});

test('reflects checked state', () => {
  render(<FilterItem type="Methods" color="#148D66" count={5} checked onToggle={() => {}} />);
  expect(screen.getByRole('checkbox', { name: 'Methods (5)' })).toBeChecked();
});

test('is a focusable native control and calls onToggle when activated', () => {
  const onToggle = jest.fn();
  render(<FilterItem type="Projects" color="#EB631A" count={3} checked={false} onToggle={onToggle} />);

  const checkbox = screen.getByRole('checkbox', { name: 'Projects (3)' });
  checkbox.focus();
  expect(checkbox).toHaveFocus();

  fireEvent.click(checkbox);
  expect(onToggle).toHaveBeenCalledTimes(1);
});
