// modal.model.ts

export type ModalKey = string;
export interface SimpleModal {
  onPositive: () => void;
  onNegative: () => void;
}

// TODO: Remove this file
