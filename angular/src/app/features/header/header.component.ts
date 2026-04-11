// header.component.ts

import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '@gofish/features/header/components/header-actions/header-actions.component';
import { AuthService } from '@gofish/shared/services/auth.service';

/**
 * Defines the visual variants available for the header component.
 */
export type HeaderVariant = 'flat' | 'overlay' | 'none';

/**
 * Main application header component.
 *
 * Responsibilities:
 * - Render navigation links and header actions
 * - Apply visual styling based on the selected variant
 * - Expose authentication state to the template
 */
@Component({
  selector: 'gf-header',
  host: {
    '[class.flat]': "variant() === 'flat'",
    '[class.overlay]': "variant() === 'overlay'",
    '[class.none]': "variant() === 'none'",
  },
  imports: [
    RouterLink,
    RouterLinkActive,
    HeaderActionsComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  /** Selected header visual variant. */
  readonly variant = input.required<HeaderVariant>();

  /** Service used to access authentication state. */
  readonly authService = inject(AuthService);
}
