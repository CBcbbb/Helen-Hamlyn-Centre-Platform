import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KeyboardHelp from './KeyboardHelp';

test('dialog has the "Keyboard Shortcuts" heading as its accessible name', () => {
  render(<KeyboardHelp show onClose={() => {}} />);
  expect(screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeInTheDocument();
});

test('renders nothing when closed', () => {
  render(<KeyboardHelp show={false} onClose={() => {}} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('moves focus into the dialog on open', async () => {
  render(<KeyboardHelp show onClose={() => {}} />);
  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
});

test('Escape closes the dialog', async () => {
  const onClose = jest.fn();
  render(<KeyboardHelp show onClose={onClose} />);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('clicking the backdrop closes the dialog', async () => {
  const onClose = jest.fn();
  const { container } = render(<KeyboardHelp show onClose={onClose} />);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  const backdrop = container.querySelector('.bg-black');
  fireEvent.click(backdrop);

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('clicking inside the dialog does not close it', async () => {
  const onClose = jest.fn();
  render(<KeyboardHelp show onClose={onClose} />);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  fireEvent.click(screen.getByText('Keyboard Shortcuts'));

  expect(onClose).not.toHaveBeenCalled();
});

test('focus returns to the previously focused element after closing', async () => {
  const trigger = document.createElement('button');
  trigger.textContent = 'Open help';
  document.body.appendChild(trigger);
  trigger.focus();
  expect(trigger).toHaveFocus();

  const { rerender } = render(<KeyboardHelp show onClose={() => {}} />);

  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());

  rerender(<KeyboardHelp show={false} onClose={() => {}} />);

  await waitFor(() => expect(trigger).toHaveFocus());

  document.body.removeChild(trigger);
});
