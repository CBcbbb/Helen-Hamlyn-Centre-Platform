// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// jsdom doesn't parse external stylesheets, so the --color-* custom properties
// in globals.css never reach getComputedStyle() under Jest. Apply them
// directly from the same file so src/utils/graphUtils.js's cssVar() reads
// resolve the same values a browser would, without a second hardcoded copy.
const globalsCss = fs.readFileSync(
  path.join(__dirname, 'globals.css'),
  'utf8'
);
for (const [, name, value] of globalsCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  document.documentElement.style.setProperty(name, value.trim());
}
