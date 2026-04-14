// requests-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FriendshipListCardComponent } from '@gofish/features/user/profile/pages/friends/components/friendship-list-card/friendship-list-card.component';
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { Path } from '@gofish/shared/constants';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-requests-list',
  imports: [
    FriendshipListCardComponent,
    AsyncButtonComponent,
    LoadingSpinnerComponent,
    LoadingErrorModalComponent
],
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.css',
})
export class RequestsListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);
  readonly router         = inject(Router);
  readonly authService    = inject(AuthService);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  readonly Path = Path;
  readonly window = window;

  requestsCursor  = signal<string | undefined>(undefined);
  requestsHasMore = signal(true);
  requestsList    = signal<FriendshipDTO[]>([]);

  requestsListReceived = computed(() => this.requestsList().filter((a) => a.receiverUserId === this.authService.userId()!));

  requests = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Pending, maxResults: 20, lastTimestamp: undefined }))
  });

  constructor() {
    effect(() => {
      if (!this.requests.hasValue()) return;
      this.requestsList.set(this.requests.value().friendships);
      this.requestsHasMore.set(this.requests.value().hasMoreResults);
      this.requestsCursor.set(this.requests.value().lastTimestamp);
    })
  }

  loadMoreFriends() {
    let profileId = this.profileContext.profileId();
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.userApi.getFriendships({
      userId: profileId,
      state: FriendshipState.Pending,
      maxResults: 20,
      lastTimestamp: this.requestsCursor()
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        this.requestsList.update(list => [...list, ...res.friendships]);
        this.requestsHasMore.set(res.hasMoreResults);
        this.requestsCursor.set(res.lastTimestamp);
        this.loadingState.success();
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.');
        this.busyState.setBusy(false);
      }
    })
  }

  onDecline(friendship: FriendshipDTO) {
    this.requestsList.update(list => list.filter(f => f.id === friendship.id));
    this.userApi.ignoreFriendship(friendship.id).subscribe();
  }
}
