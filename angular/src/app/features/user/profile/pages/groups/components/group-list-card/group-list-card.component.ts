import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'gf-group-list-card',
  imports: [
    RouterLink,
  ],
  templateUrl: './group-list-card.component.html',
  styleUrl: './group-list-card.component.css',
})
export class GroupListCardComponent {
  readonly authService    = inject(AuthService);
  readonly profileContext = inject(ProfileContext);
  readonly avatarService  = inject(AvatarService);
  readonly userApi        = inject(UserApi);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  group   = input.required<UserGroupDTO>();
  actions = input.required<boolean>();

  accepted = output<UserGroupDTO>();
  declined = output<UserGroupDTO>();

  isAccepted = signal<boolean>(false);

  onAccept() {
    // this.accepted.emit(this.friendship());
    // this.busyState.setBusy(true);
    // this.userApi.acceptFriendship(this.friendship().id).subscribe({
    //   next: () => {
    //     this.busyState.setBusy(false);
    //     this.isAccepted.set(true);
    //   },
    //   error: () => {
    //     this.busyState.setBusy(false);
    //   }
    // });
  }

  onDecline() {
    // this.declined.emit(this.friendship());
  }
}
