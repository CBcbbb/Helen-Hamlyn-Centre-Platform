import { render, screen } from '@testing-library/react';
import App from './App';

// jsdom doesn't implement the SVG geometry methods d3-zoom relies on
// (getScreenCTM, etc.), so GraphView's D3 setup effect throws under Jest.
// This smoke test only checks the app shell renders, so GraphView is
// stubbed out here rather than pulling in an SVG polyfill for one test.
jest.mock('./components/GraphView', () => {
  const React = require('react');
  return function GraphViewMock() {
    return React.createElement('div', { 'data-testid': 'graphview-mock' });
  };
});

const mockGraphData = {
  nodes: [
    { id: 'p1', type: 'People', name: 'Test Person' },
  ],
};
const mockLinksCsv = 'SourceType,SourceID,TargetType,TargetID,Strength\n';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('graphData.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGraphData) });
    }
    if (url.includes('LINKS.csv')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve(mockLinksCsv) });
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders app title once data loads', async () => {
  render(<App />);
  const titleElement = await screen.findByRole('heading', { level: 1, name: /Data Platform/i });
  expect(titleElement).toBeInTheDocument();
});
