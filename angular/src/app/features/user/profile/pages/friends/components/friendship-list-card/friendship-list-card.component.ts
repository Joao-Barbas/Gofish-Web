// friendship-list-card.component.ts

import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'gf-friendship-list-card',
  imports: [
    RouterLink,
    AsyncButtonComponent
  ],
  templateUrl: './friendship-list-card.component.html',
  styleUrl: './friendship-list-card.component.css',
})
export class FriendshipListCardComponent {
  readonly authService    = inject(AuthService);
  readonly profileContext = inject(ProfileContext);
  readonly avatarService  = inject(AvatarService);
  readonly userApi        = inject(UserApi);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  friendship = input.required<FriendshipDTO>();
  small      = input.required<boolean>();
  actions    = input.required<boolean>();

  accepted = output<FriendshipDTO>();
  declined = output<FriendshipDTO>();

  isAccepted = signal<boolean>(false);

  onAccept() {
    this.accepted.emit(this.friendship());
    this.busyState.setBusy(true);
    this.userApi.acceptFriendship(this.friendship().id).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.isAccepted.set(true);
      },
      error: () => {
        this.busyState.setBusy(false);
      }
    });
  }

  onDecline() {
    this.declined.emit(this.friendship());
  }
}
