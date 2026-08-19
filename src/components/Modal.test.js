import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from './Modal';

const showModal = { id: 'intro', label: 'Introduction', content: 'Some content' };

test('closes on Escape and restores focus to the previously focused element', async () => {
  const setShowModal = jest.fn();

  const trigger = document.createElement('button');
  trigger.textContent = 'Open';
  document.body.appendChild(trigger);
  trigger.focus();
  expect(trigger).toHaveFocus();

  const { rerender } = render(<Modal showModal={showModal} setShowModal={setShowModal} />);

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(setShowModal).toHaveBeenCalledWith(null);

  rerender(<Modal showModal={null} setShowModal={setShowModal} />);

  await waitFor(() => {
    expect(trigger).toHaveFocus();
  });

  document.body.removeChild(trigger);
});

test('traps Tab within the dialog', async () => {
  render(<Modal showModal={showModal} setShowModal={() => {}} />);

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  const closeButtons = screen.getAllByRole('button', { name: /close/i });
  const lastButton = closeButtons[closeButtons.length - 1];
  lastButton.focus();

  fireEvent.keyDown(document, { key: 'Tab' });
  // With only close buttons focusable and no shiftKey, focus wraps to the first one.
  expect(closeButtons[0]).toHaveFocus();
});
