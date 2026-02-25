import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Path } from "@gofish/shared/constants";
import { PopupController } from "@gofish/shared/core/popup-controller";
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { SimplePopup } from "@gofish/shared/models/popup.model";
import { AuthService } from "@gofish/shared/services/auth.service";

@Component({
  selector: 'app-user-popup',
  imports: [ CommonModule, ClickOutsideDirective, RouterLink ],
  templateUrl: './user-popup.component.html',
  styleUrl: './user-popup.component.css'
})
export class UserPopupComponent implements SimplePopup {
  readonly popupController = new PopupController('header-user-popup');

  readonly Path = Path;

  constructor(
    readonly authService: AuthService,
    readonly router: Router
  ){}

  onSignOutClick() {
    this.authService.signOut();
    this.popupController.close();
  }
}
