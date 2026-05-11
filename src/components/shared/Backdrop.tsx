'use client';

/**
 * Backdrop — semi-opaque overlay behind drawers and dialogs.
 *
 * Clicking the backdrop dismisses the overlay it sits behind. Stays
 * presentational; the wrapping component decides what "dismiss" means.
 */

import type { ReactNode } from 'react';

interface BackdropProps {
  onDismiss: () => void;
  children?: ReactNode;
  testid?: string;
}

export function Backdrop({ onDismiss, children, testid }: BackdropProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:justify-end"
      data-testid={testid}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      {children}
    </div>
  );
}
