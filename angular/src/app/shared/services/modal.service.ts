// modal.service.ts

import { Injectable, signal } from '@angular/core';
import { ModalKey, SimpleModal } from '@gofish/shared/models/modal.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _activeModal = signal<ModalKey | null>(null);
  private _modalObject = signal<SimpleModal | null>(null);

  public activeModal = this._activeModal.asReadonly();
  public modalObject = this._modalObject.asReadonly();

  public open(key: ModalKey, data?: SimpleModal) {
    this._modalObject.set(data || null);
    this._activeModal.set(key);
    document.body.style.overflow = 'hidden'; // Lock scroll
  }

  public close() {
    this._activeModal.set(null);
    this._modalObject.set(null);
    document.body.style.overflow = ''; // Unlock scroll
  }
}
