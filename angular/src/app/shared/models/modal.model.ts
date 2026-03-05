export type ModalKey = 'example-name-modal' // Update this when creating new concrete modals
  | 'totp-validation-modal'
  | 'confirm-deletion-modal';

export interface SimpleModal {
  onPositive: () => void;
  onNegative: () => void;
}
