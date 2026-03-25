import { CommonModule } from "@angular/common";
import { Component, resource } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { UserProfileApi } from "@gofish/shared/api/user-profile.api";
import { Path, PathSegment } from "@gofish/shared/constants";
import { PopupController } from "@gofish/shared/core/popup-controller";
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { SimplePopup } from "@gofish/shared/models/popup.model";
import { AuthService } from "@gofish/shared/services/auth.service";
import { AvatarService } from "@gofish/shared/services/avatar.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-user-popup',
  imports: [ CommonModule, ClickOutsideDirective, RouterLink ],
  templateUrl: './user-popup.component.html',
  styleUrl: './user-popup.component.css'
})
export class UserPopupComponent implements SimplePopup {
  readonly popupController = new PopupController('header-user-popup');

  readonly Path = Path;
  readonly PathSegment = PathSegment;

  avatarUrl = resource({
    params: () => this.authService.userId()!,
    loader: ({ params: id }) => firstValueFrom(this.userProfileApi.getUserAvatar(id))
  })

  constructor(
    readonly authService: AuthService,
    readonly userProfileApi: UserProfileApi,
    readonly avatarService: AvatarService,
    readonly router: Router
  ){}

  onSignOutClick() {
    this.authService.signOut();
    this.popupController.close();
  }
}
