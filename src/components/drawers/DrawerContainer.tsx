'use client';

/**
 * DrawerContainer — shared shell for ProvinceDrawer, NationDrawer, etc.
 *
 * Mobile / tablet: slides up from the bottom (half-screen sheet).
 * Desktop (sm:): docks to the right edge (full-height panel).
 *
 * The wrapping component owns close behavior; the container just
 * renders the close button and the content area.
 */

import type { ReactNode } from 'react';
import { Backdrop } from '@/components/shared/Backdrop';

interface DrawerContainerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  testid?: string;
}

export function DrawerContainer({
  open,
  onClose,
  title,
  subtitle,
  children,
  testid,
}: DrawerContainerProps) {
  if (!open) return null;
  return (
    <Backdrop onDismiss={onClose} testid={testid ? `${testid}-backdrop` : undefined}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testid}
        className="flex h-[60vh] w-full flex-col rounded-t-xl border-t border-neutral-700 bg-neutral-950 text-neutral-100 shadow-2xl sm:h-full sm:w-[420px] sm:rounded-none sm:rounded-l-xl sm:border-l sm:border-t-0"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle ? (
              <p className="text-xs text-neutral-400">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid={testid ? `${testid}-close` : 'drawer-close'}
            className="flex h-11 w-11 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
          {children}
        </div>
      </aside>
    </Backdrop>
  );
}
