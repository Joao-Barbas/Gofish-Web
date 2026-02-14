/* header-actions.component.ts */

import { Component, inject, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PopupAdminComponent } from '@gofish/features/header/header-actions/popup-admin/popup-admin.component';
import { PopupUserComponent } from '@gofish/features/header/header-actions/popup-user/popup-user.component';
import { PopupId } from '@gofish/shared/interfaces/popup.interface';

@Component({
  selector: 'app-header-actions',
  imports: [ CommonModule, PopupAdminComponent, PopupUserComponent ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  private authService = inject(AuthService);
  private popupService = inject(PopupService);

  public isOpenAdmin$ = this.popupService.isOpen$('header-admin');
  toggleAdmin() { this.popupService.toggle('header-admin'); }
  openAdmin() { this.popupService.open('header-admin'); }
  closeAdmin() { this.popupService.close(); }

  get isAdmin(): boolean {
    return true; // this.authService.isAdmin();
  }

  get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  // toggleAdmin() { this.adminPopup.toggle(); }
  // toggleUser() { this.userPopup.toggle(); }

  // @HostListener('document:keydown.escape')
  // onEscapeKey() {
  //   this.closeDropdown();
  // }
}
