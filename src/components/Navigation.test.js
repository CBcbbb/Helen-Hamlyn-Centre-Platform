import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from './Navigation';

const data = { nodes: [], links: [] };

test('accessibility panel content does not claim arrow-key map navigation or WCAG AA conformance', () => {
  const setShowModal = jest.fn();
  render(
    <Navigation isNavExpanded setIsNavExpanded={() => {}} setShowModal={setShowModal} data={data} />
  );

  fireEvent.click(screen.getByRole('button', { name: /Open Accessibility dialog/i }));

  expect(setShowModal).toHaveBeenCalledTimes(1);
  const content = setShowModal.mock.calls[0][0].content;
  expect(content).not.toMatch(/arrow keys.*map view/i);
  expect(content).not.toMatch(/WCAG 2\.2 AA compliant/i);
  expect(content).not.toMatch(/all interactive elements/i);
});
