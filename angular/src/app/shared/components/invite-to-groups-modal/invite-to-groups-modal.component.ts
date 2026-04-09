// invite-to-groups-modal.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { UserApi } from '@gofish/shared/api/user.api';
import { Path } from '@gofish/shared/constants';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalController, ModalKey } from '@gofish/shared/core/modal-controller';
import { GetInvitableGroupsResDTO, UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { toast } from 'ngx-sonner';
import { GroupApi } from '@gofish/shared/api/group.api';
import { finalize } from 'rxjs';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AsyncButtonComponent } from "../async-button-3/async-button-3.component";

type InviteState = 'ready' | 'inviting' | 'invited';
interface InvitableGroup extends UserGroupDTO {
  inviteState: WritableSignal<InviteState>;
}

@Component({
  selector: 'gf-invite-to-groups-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    AsyncButtonComponent
  ],
  templateUrl: './invite-to-groups-modal.component.html',
  styleUrl: './invite-to-groups-modal.component.css',
})
export class InviteToGroupsModalComponent implements SimpleModal {
  static readonly Key: ModalKey = 'gf-invite-to-groups-modal';

  readonly avatarService = inject(AvatarService);
  readonly userApi = inject(UserApi);
  readonly groupApi = inject(GroupApi);

  readonly controller = new ModalController(InviteToGroupsModalComponent.Key);
  readonly busyState = new BusyState();
  readonly moreGroupLoadingState = new LoadingState();

  readonly targetUserId = input.required<string>();
  readonly targetUserName = input.required<string>();

  readonly Path = Path;
  readonly window = window;
  readonly toast = toast;

  groupsCursor  = signal<string | undefined>(undefined);
  groupsHasMore = signal(true);
  groupsList    = signal<InvitableGroup[]>([]);

  groups = rxResource({
    params: () => this.targetUserId(),
    stream: ({ params: id }) => this.userApi.getInvitableGroups({ targetUserId: id, maxResults: 100 })
  });

  readonly searchQuery = signal('');
  readonly filteredGroups = computed(() => {
    const query = this.searchQuery().toUpperCase().trim();
    const list  = this.groupsList();
    if (!query) return list;
    return list.filter(g => g.name.toUpperCase().includes(query));
  });

  constructor() {
    effect(() => {
      if (!this.groups.hasValue()) return;
      let v = this.groups.value();
      this.groupsList.set(v.groups.map(group => ({ ...group, inviteState: signal('ready') })));
      this.groupsHasMore.set(v.hasMoreResults);
      this.groupsCursor.set(v.lastTimestamp);
    })
  }

  loadMoreGroups() {
    this.busyState.setBusy(true);
    this.moreGroupLoadingState.start();
    this.userApi.getInvitableGroups({
      targetUserId: this.targetUserId(),
      maxResults: 100,
      lastTimestamp: this.groupsCursor()
    }).pipe(finalize(() => {
      this.busyState.setBusy(false);
      this.moreGroupLoadingState.success();
    })).subscribe({
      next: (res: GetInvitableGroupsResDTO) => {
        let treated = res.groups.map<InvitableGroup>(group => ({ ...group, inviteState: signal('ready') }));
        this.groupsList.update(groups => [...groups, ...treated]);
        this.groupsHasMore.set(res.hasMoreResults);
        this.groupsCursor.set(res.lastTimestamp);
        this.moreGroupLoadingState.success();
        this.busyState.setBusy(false);
      },
      error: () => {
        toast.error('Something went wrong. Try again later.');
      }
    })
  }

  // Modal events

  onPositive(): void { this.controller.close(); }
  onNegative(): void { this.controller.close(); }

  // Events

  onInvite(group: InvitableGroup): void {
    if (group.inviteState() === 'invited') return;
    group.inviteState.set('inviting');
    this.groupApi.createGroupInvite({
      groupId: group.id,receiverUserId: this.targetUserId()
    }).subscribe({
      next: () => group.inviteState.set('invited'),
      error: () => toast.error('Something went wrong. Try again later.')
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}
