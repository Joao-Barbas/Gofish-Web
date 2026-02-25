import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { AdminPopupComponent } from '@gofish/features/header/header-actions/components/admin-popup/admin-popup.component';
import { UserPopupComponent } from '@gofish/features/header/header-actions/components/user-popup/user-popup.component';
import { Router } from '@angular/router';
import { Path } from '@gofish/shared/constants';

@Component({
  selector: 'app-header-actions',
  imports: [ CommonModule, AdminPopupComponent, UserPopupComponent ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  Path = Path;

  constructor(
    private readonly router: Router,
    public  readonly popupService: PopupService,
    public  readonly authService: AuthService
  ){}

  onSignInClick() {
    this.router.navigate([Path.SIGN_IN]);
  }

  onUserClick(event: Event): void {
    this.popupService.toggle('header-user-popup');
    event.stopPropagation();
  }

  onAdminClick(event: Event): void {
    this.popupService.toggle('header-admin-popup');
    event.stopPropagation();
  }
}
