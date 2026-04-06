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

@Component({
  selector: 'gf-group-invites-card',
  imports: [RouterLink, AsyncButtonComponent],
  templateUrl: './group-invites-card.component.html',
  styleUrl: './group-invites-card.component.css',
})
export class GroupInvitesCardComponent {
  readonly avatarService  = inject(AvatarService);
  readonly profileContext = inject(ProfileContext);
  readonly groupApi       = inject(GroupApi);
  readonly router         = inject(Router);

  readonly busyState: BusyState = new BusyState();

  readonly toast = toast;
  readonly Path = Path;

  groupInvite = input.required<GroupInviteDTO>();

  accepted = output<GroupInviteDTO>();
  declined = output<GroupInviteDTO>();

  isAccepted = signal<boolean>(false);

  ngOnInit() {
    console.log(this.groupInvite())
  }

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

  onDecline() {
    this.declined.emit(this.groupInvite()); // Parent handles thanos snapping
  }
}
