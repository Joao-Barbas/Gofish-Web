// friends.component.ts

import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsReqDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { AuthService } from '@gofish/shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { FriendsListComponent } from "./components/friends-list/friends-list.component";
import { RequestsListComponent } from "./components/requests-list/requests-list.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { ProfileFriendsTab } from '@gofish/shared/constants';

@Component({
  selector: 'app-friends',
  imports: [
    RouterLink,
    RequestsListComponent,
    FriendsListComponent
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent {
  readonly activeTab = input<ProfileFriendsTab | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=
  readonly activeTabOrDefault = computed<ProfileFriendsTab>(() => this.activeTab() ?? 'friends' )

  readonly userApi        = inject(UserApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService    = inject(AuthService);

  constructor() { }
}
