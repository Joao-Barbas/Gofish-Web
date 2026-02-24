// modal.service.ts

import { Injectable, signal } from '@angular/core';
import { ModalKey } from '@gofish/shared/models/modal.model';

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
