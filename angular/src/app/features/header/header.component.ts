// header.component.ts

import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '@gofish/features/header/components/header-actions/header-actions.component';
import { AuthService } from '@gofish/shared/services/auth.service';

export type HeaderKind = 'flat' | 'overlay' | 'none';

@Component({
  selector: 'gf-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    HeaderActionsComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly kind = input.required<HeaderKind>();
}
