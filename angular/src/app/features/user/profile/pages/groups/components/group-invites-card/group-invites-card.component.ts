// group-invites-card.component.ts

import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { Component, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupInviteDTO } from '@gofish/shared/dtos/group.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";
import { BusyState } from '@gofish/shared/core/busy-state';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { GroupApi } from '@gofish/shared/api/group.api';
import { Path } from '@gofish/shared/constants';

/**
 * Displays a single group invite card and exposes actions
 * for accepting or declining the invitation.
 *
 * Responsibilities:
 * - Render group invite information
 * - Handle invite acceptance through the backend API
 * - Notify the parent component when an invite is accepted or declined
 * - Expose busy and accepted state to the template
 */
@Component({
  selector: 'gf-group-invites-card',
  imports: [RouterLink, AsyncButtonComponent],
  templateUrl: './group-invites-card.component.html',
  styleUrl: './group-invites-card.component.css',
})
export class GroupInvitesCardComponent {
  /** Service used to resolve avatar image URLs. */
  readonly avatarService  = inject(AvatarService);

  /** Profile context service exposed to the template if needed. */
  readonly profileContext = inject(ProfileContext);

  /** API used to manage group invite actions. */
  readonly groupApi       = inject(GroupApi);

  /** Router instance used for navigation actions. */
  readonly router         = inject(Router);

  /** Busy state used while the accept invite request is in progress. */
  readonly busyState: BusyState = new BusyState();

  /** Toast API exposed to the template and component methods. */
  readonly toast = toast;

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Group invite data displayed by the card. */
  groupInvite = input.required<GroupInviteDTO>();

  /** Event emitted when the invite is accepted. */
  accepted = output<GroupInviteDTO>();

  /** Event emitted when the invite is declined. */
  declined = output<GroupInviteDTO>();

  /** Indicates whether the invite has been accepted successfully. */
  isAccepted = signal<boolean>(false);

  /**
   * Initializes the component.
   */
  ngOnInit() {
    console.log(this.groupInvite())
  }

  /**
   * Accepts the current group invite.
   *
   * Behavior:
   * - Emits the accepted event
   * - Sends the accept invite request to the backend
   * - Updates busy and accepted state
   * - Displays an error toast on failure
   */
  onAccept() {
    this.accepted.emit(this.groupInvite());
    this.busyState.setBusy(true);
    this.groupApi.acceptGroupInvite(
      this.groupInvite().id
    ).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: () => this.isAccepted.set(true),
      error: () => this.toast.error('Something went wrong while trying to accept invite. Try again later.')
    })
  }

  /**
   * Declines the current group invite.
   *
   * Behavior:
   * - Emits the declined event for the parent component to handle
   */
  onDecline() {
    this.declined.emit(this.groupInvite()); // Parent handles thanos snapping
  }
}
