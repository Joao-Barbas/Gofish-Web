/* flat-header.component.ts */

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '../header-actions/header-actions.component';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-flat-header',
  imports: [ RouterLink, RouterLinkActive, HeaderActionsComponent ],
  templateUrl: './flat-header.component.html',
  styleUrl: './flat-header.component.css'
})
export class FlatHeaderComponent {
  readonly authService = inject(AuthService);
}
