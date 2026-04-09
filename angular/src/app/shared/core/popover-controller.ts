// popover-controller.ts

import { computed, inject } from '@angular/core';
import { PopoverService } from '@gofish/shared/services/popover.service';

/** Unique identifier for a popover instance. */
export type PopoverKey = string;

/**
 * Composition class for popover components.
 * Instantiate in any component that acts as a popover to get
 * toggle/open/close behavior tied to a specific key.
 *
 * @example
 * ```ts
 * class ProfileActionsPopoverComponent {
 *   static readonly Key: PopoverKey = 'gf-profile-actions-popover'; // Usually the selector here
 *   readonly controller = new PopoverController(ProfileActionsPopoverComponent.Key); // Public
 * }
 * ```
 */
export class PopoverController {
  private readonly popoverService = inject(PopoverService);

  readonly active   = computed(() => this.popoverService.activePopover() === this.key);
  readonly isActive = computed(() => this.popoverService.activePopover() === this.key);

  constructor(readonly key: PopoverKey) { }

  toggle(): void { this.popoverService.toggle(this.key); }
  open(): void { this.popoverService.open(this.key); }
  close(): void { this.popoverService.close(); }
}
