import { useEffect } from 'react';

// Shared dialog focus-management: save/restore focus, focus the dialog on
// open, trap Tab/Shift+Tab inside it, and close on Escape. Used by any
// modal-like overlay (Modal.js, GraphView's mobile filter panel) so there is
// one tested implementation instead of several hand-rolled copies.
//
// Pass `modal: false` for a non-modal use (e.g. NodeDetails' desktop
// complementary panel): initial focus, Escape-to-close, and focus
// restoration still apply, but Tab/Shift+Tab are left alone so focus can
// move freely to the rest of the page, matching non-modal semantics
// (no aria-modal, background stays operable).
const useDialogFocusTrap = ({ isOpen, onClose, containerRef, modal = true }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;

    const focusTimeout = setTimeout(() => {
      containerRef.current?.focus();
    }, 100);

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    if (modal) {
      document.addEventListener('keydown', handleTabKey);
    }

    return () => {
      clearTimeout(focusTimeout);
      document.removeEventListener('keydown', handleEscape);
      if (modal) {
        document.removeEventListener('keydown', handleTabKey);
      }
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, containerRef, modal]);
};

export default useDialogFocusTrap;
