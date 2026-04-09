// header.component.ts

import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '@gofish/features/header/components/header-actions/header-actions.component';
import { AuthService } from '@gofish/shared/services/auth.service';

export type HeaderVariant = 'flat' | 'overlay' | 'none';

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
  readonly variant     = input.required<HeaderVariant>();
  readonly authService = inject(AuthService);
}
