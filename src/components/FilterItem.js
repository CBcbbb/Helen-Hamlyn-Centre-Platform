import React from 'react';
import { BORDER_MUTED } from '../utils/graphUtils';

const SIZE_CLASSES = {
  desktop: {
    row: 'flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors',
    box: 'w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all',
    check: 'w-3 h-3 text-white',
    label: 'text-sm select-none',
  },
  mobile: {
    row: 'flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors',
    box: 'w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-all',
    check: 'w-4 h-4 text-white',
    label: 'text-base select-none',
  },
};

// A real checkbox + label for a node-type filter, shared by GraphView's
// desktop panel and mobile filter dialog. The colored box + checkmark are a
// decorative layer on top of a native (visually hidden) checkbox input, so
// the control is keyboard-operable and its accessible name/state come for
// free from the browser.
const FilterItem = ({ type, color, count, checked, onToggle, variant = 'desktop' }) => {
  const classes = SIZE_CLASSES[variant] || SIZE_CLASSES.desktop;
  const inputId = `filter-${variant}-${type}`;

  return (
    <label htmlFor={inputId} className={classes.row}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only filter-checkbox-input"
      />
      <span
        className={classes.box}
        aria-hidden="true"
        style={{
          backgroundColor: checked ? color : 'white',
          borderColor: checked ? color : BORDER_MUTED,
        }}
      >
        {checked && (
          <svg className={classes.check} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      <span className={`${classes.label} ${checked ? 'text-gray-900' : 'text-gray-400'}`}>
        {type} ({count})
      </span>
    </label>
  );
};

export default FilterItem;
