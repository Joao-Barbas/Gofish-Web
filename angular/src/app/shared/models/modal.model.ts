export type ModalKey = 'example-modal' // Update this when creating new modal components
  | 'confirm-action-modal'
  | 'confirm-deletion-modal';

export interface SimpleModal {
  onPositive: () => void;
  onNegative: () => void;
}
