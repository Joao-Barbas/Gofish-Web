import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
//import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';

/**
 * Displays a group entry card in a user-related list.
 *
 * Responsibilities:
 * - Render group information
 * - Expose optional action state to the template
 * - Provide placeholders for accept and decline interactions
 * - Track loading and busy UI state
 */
@Component({
  selector: 'gf-group-list-card',
  imports: [
    //AsyncButtonComponent,
    RouterLink,
  ],
  templateUrl: './group-list-card.component.html',
  styleUrl: './group-list-card.component.css',
})
export class GroupListCardComponent {
  /** Service used to access authentication state. */
  readonly authService = inject(AuthService);

  /** Profile context service exposed to the template if needed. */
  readonly profileContext = inject(ProfileContext);

  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** API used for user-related actions. */
  readonly userApi = inject(UserApi);

  /** Loading state used for UI feedback. */
  readonly loadingState: LoadingState = new LoadingState();

  /** Busy state used to prevent duplicate actions. */
  readonly busyState: BusyState = new BusyState();

  /** Group data displayed by the card. */
  group = input.required<UserGroupDTO>();

  /** Indicates whether action controls should be shown. */
  actions = input.required<boolean>();

  /** Event emitted when the group is accepted. */
  accepted = output<UserGroupDTO>();

  /** Event emitted when the group is declined. */
  declined = output<UserGroupDTO>();

  /** Indicates whether the current item has been accepted. */
  isAccepted = signal<boolean>(false);

  /**
   * Placeholder handler for the accept action.
   */
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

  /**
   * Placeholder handler for the decline action.
   */
  onDecline() {
    // this.declined.emit(this.friendship());
  }
}
