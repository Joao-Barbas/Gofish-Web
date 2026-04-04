// popup.model.ts

import { PopoverKey } from '@gofish/shared/core/popover-controller';
import { PopoverController } from '@gofish/shared/core/popover-controller';

/**
 * @deprecated Use {@link PopoverKey} instead.
 */
export type PopupKey = string | 'example-key-popup' // Update this when creating new popup components
  | 'header-user-popup'
  | 'header-admin-popup'
  | 'choose-pin-popup'
  | 'pin-preview'
  | 'cluster-preview'
  | 'group-options';

/**
 * @deprecated Instatiate {@link PopoverController} instead.
 */
export interface SimplePopup {
  // toggle(): void;
  // open(): void;
  // close(): void;
}

// TODO: Remove this file
