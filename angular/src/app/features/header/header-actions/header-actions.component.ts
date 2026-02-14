/* header-actions.component.ts */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PopupAdminComponent } from '@gofish/features/header/header-actions/components/popup-admin/popup-admin.component';
import { PopupUserComponent } from '@gofish/features/header/header-actions/components/popup-user/popup-user.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-actions',
  imports: [ CommonModule, PopupAdminComponent, PopupUserComponent ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  private router        = inject(Router);
  private popupService  = inject(PopupService);
  private authService   = inject(AuthService);

  public isUserPopupOpen$  = this.popupService.isOpen$(PopupUserComponent.key);
  public isAdminPopupOpen$ = this.popupService.isOpen$(PopupAdminComponent.key);

  public get isAdmin(): boolean {
    return true; // this.authService.isAdmin();
  }

  public get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  routeSignIn() {
    this.router.navigateByUrl('/user/signin');
  }

  public toggleUserPopup(): void { this.popupService.toggle(PopupUserComponent.key); }
  public toggleAdminPopup(): void { this.popupService.toggle(PopupAdminComponent.key); }

  // @HostListener('document:keydown.escape')
  // onEscapeKey() {
  //   this.closeDropdown();
  // }
}
