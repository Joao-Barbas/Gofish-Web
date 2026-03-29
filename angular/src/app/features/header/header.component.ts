// header.component.ts

import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '@gofish/features/header/components/header-actions/header-actions.component';
import { AuthService } from '@gofish/shared/services/auth.service';

export type HeaderKind = 'flat' | 'overlay' | 'none';

@Component({
  selector: 'gf-header',
  host: {
    '[class.flat]': "kind() === 'flat'",
    '[class.overlay]': "kind() === 'overlay'"
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
  readonly kind = input.required<HeaderKind>();

  readonly router      = inject(Router);
  readonly authService = inject(AuthService);
}
