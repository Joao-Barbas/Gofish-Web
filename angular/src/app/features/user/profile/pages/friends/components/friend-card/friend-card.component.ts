import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';
import { FriendshipDTO, FriendshipUserDTO } from '@gofish/shared/dtos/user.dto';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { UserApi } from '@gofish/shared/api/user.api';

@Component({
  selector: 'app-friend-card',
  imports: [
    RouterLink,
    AsyncButtonComponent
  ],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.css',
})
export class FriendCardComponent {
  readonly defaultAvatar = 'assets/vectors/avatar-template-dark.clr.svg';

  private readonly userApi = inject(UserApi);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  friendship = input.required<FriendshipDTO>();
  user       = input.required<FriendshipUserDTO>();
  actions    = input.required<boolean>();

  accepted = output<FriendshipDTO>();
  declined = output<FriendshipDTO>();

  isAccepted = signal<boolean>(false);

  onAccept() {
    this.accepted.emit(this.friendship());
    this.busyState.setBusy(true);
    this.userApi.acceptFriendship(this.friendship().requesterUserId).subscribe({
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
