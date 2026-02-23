// popup-user.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { BasePopupComponent, PopupKey } from '@gofish/shared/models/popup.model';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-popup-user',
  imports: [ CommonModule, ClickOutsideDirective ],
  templateUrl: './popup-user.component.html',
  styleUrl: './popup-user.component.css'
})
export class PopupUserComponent extends BasePopupComponent {
  static readonly key: PopupKey = 'popup-header-user';

  readonly authService = inject(AuthService);

  onSignOutClick() {
    this.authService.signOut();
    this.close();
  }
}
