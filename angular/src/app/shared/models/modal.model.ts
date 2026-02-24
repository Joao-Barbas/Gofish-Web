// modal.model.ts

export type ModalKey = // Update this when creating new concrete modals
  'example-modal' |
  'confirm-action-modal' |
  'confirm-deletion-modal';

export interface SimpleModal {
  onPositive: () => void;
  onNegative: () => void;
}
