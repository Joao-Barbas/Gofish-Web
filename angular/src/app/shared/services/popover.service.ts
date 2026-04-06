// popover.service.ts

import { Injectable, signal } from '@angular/core';
import { PopoverKey } from '@gofish/shared/core/popover-controller';

/**
 * Global popover state manager.
 * Only one popover can be active at a time.
 * Opening one closes the previous.
 *
 * Usage from components:
 * Prefer using PopoverController (composition class)
 * instead of injecting this directly.
 */
@Injectable({ providedIn: 'root' })
export class PopoverService {
  private _activePopover = signal<PopoverKey | null>(null);
  readonly activePopover = this._activePopover.asReadonly();

  toggle(key: PopoverKey): void {
    this._activePopover.update(current => current === key ? null : key);
  }

  open(key: PopoverKey): void {
    this._activePopover.set(key);
  }

  close(): void {
    this._activePopover.set(null);
  }

  closeKey(key: PopoverKey): void {
    this._activePopover.update(current => current === key ? null : current);
  }

  isOpen(key: PopoverKey): boolean {
    return this._activePopover() === key;
  }
}
