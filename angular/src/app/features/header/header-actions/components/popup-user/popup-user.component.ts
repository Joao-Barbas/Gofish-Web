/* popup-user.component.ts */

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BasePopupComponent, PopupKey } from '@gofish/shared/models/popup.model';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-popup-user',
  imports: [ CommonModule ],
  templateUrl: './popup-user.component.html',
  styleUrl: './popup-user.component.css'
})
export class PopupUserComponent extends BasePopupComponent {
  public static readonly key: PopupKey = 'popup-header-user';
  private authService = inject(AuthService);

  get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  signOut() {
    this.authService.signOut();
    this.close();
  }
}
