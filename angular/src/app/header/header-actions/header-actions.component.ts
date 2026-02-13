/* header-actions.component.ts */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PopupAdminComponent } from '@gofish/header/header-actions/popup-admin/popup-admin.component';
import { PopupUserComponent } from '@gofish/header/header-actions/popup-user/popup-user.component';

@Component({
  selector: 'app-header-actions',
  imports: [ CommonModule, PopupAdminComponent, PopupUserComponent ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  private authService = inject(AuthService);
  private popupService = inject(PopupService);

  get isAdmin(): boolean {
    return true; // this.authService.isAdmin();
  }

  get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  // toggleDropdown(dropdown: DropdownType) {
  //   this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  // }

  // closeDropdown() {
  //   this.activeDropdown = null;
  // }

  // onSearch() {
  //   if (this.searchQuery.trim()) {
  //     // Emit search event or navigate
  //     console.log('Search:', this.searchQuery);
  //     this.closeDropdown();
  //   }
  // }

  // signOut() {
  //   //this.authService.signOut();
  //   this.closeDropdown();
  // }

  // @HostListener('document:keydown.escape')
  // onEscapeKey() {
  //   this.closeDropdown();
  // }
}



/*

// In HeaderActionsComponent
isUserOpen$ = this.popupService.isOpen$('header-user');
isSearchOpen$ = this.popupService.isOpen$('header-search');

toggleUser() { this.popupService.toggle('header-user'); }


// In MapComponent
isMenuOpen$ = this.popupService.isOpen$('map-pin-menu');

toggleMenu() { this.popupService.toggle('map-pin-menu'); }


<!-- backdrop can live in app.component or each component -->
<div class="dropdown-backdrop" *ngIf="popupService.isAnyOpen$ | async" (click)="popupService.close()"></div>
*/
