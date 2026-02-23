/* header-actions.component.ts */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PopupAdminComponent } from '@gofish/features/header/header-actions/components/popup-admin/popup-admin.component';
import { PopupUserComponent } from '@gofish/features/header/header-actions/components/popup-user/popup-user.component';
import { Router } from '@angular/router';
import { Path } from '@gofish/shared/constants';

@Component({
  selector: 'app-header-actions',
  imports: [ CommonModule, PopupAdminComponent, PopupUserComponent ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  private router = inject(Router);

  readonly popupService  = inject(PopupService);
  readonly authService   = inject(AuthService);

  public isUserPopupOpen$  = this.popupService.isOpen$(PopupUserComponent.key);
  public isAdminPopupOpen$ = this.popupService.isOpen$(PopupAdminComponent.key);

  onSignInClick() {
    this.router.navigate([Path.SIGN_IN]);
  }

  onUserClick(event: Event): void {
    this.popupService.toggle(PopupUserComponent.key);
    event.stopPropagation();
  }

  onAdminClick(event: Event): void {
    this.popupService.toggle(PopupAdminComponent.key);
    event.stopPropagation();
  }
}
