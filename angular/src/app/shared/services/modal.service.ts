// modal.service.ts

import { Injectable, signal } from '@angular/core';
import { ModalKey } from '@gofish/shared/models/modal.model';

/**
 * Global modal state manager.
 * Only one modal can be active at a time.
 * Opening one closes the previous.
 *
 * Usage from components:
 * Prefer using ModalController (composition class)
 * instead of injecting this directly.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private _activeModal = signal<ModalKey | null>(null);
  readonly activeModal = this._activeModal.asReadonly();

  open(key: ModalKey) {
    this._activeModal.set(key);
    document.body.style.overflow = 'hidden'; // Lock scroll
  }

  close() {
    this._activeModal.set(null);
    document.body.style.overflow = ''; // Unlock scroll
  }
}
