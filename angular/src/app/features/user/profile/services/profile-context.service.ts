// profile-context.service.ts

import { computed, inject, Injectable, signal } from '@angular/core';
import { UserProfileDTO } from '@gofish/shared/dtos/user-profile.dto';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserManagerService } from '@gofish/shared/services/user-manager.service';

@Injectable({ providedIn: 'root' })
export class ProfileContext {
  private readonly userManagerService = inject(UserManagerService);
  private readonly authService = inject(AuthService);

  // Profile

  private _profileId = signal<string>(null!);
  readonly profileId = this._profileId.asReadonly();

  private _profile = signal<UserProfileDTO>(null!);
  readonly profile = this._profile.asReadonly();

  readonly profileFriendship = computed<FriendshipDTO | null>(() => this._profile()?.friendship ?? null);
  readonly profileSentRequest = computed<boolean>(() => this.profileFriendship()?.requesterUserId === this._profileId());
  readonly profileFriendshipIsPending = computed<boolean>(() => this.profileFriendship()?.state === FriendshipState.Pending);

  // Viewer relationship with this profile

  readonly viewerIsProfileOwner = computed<boolean>(() => this._profileId() === this.authService.userId());
  readonly viewerIsFriend = computed<boolean>(() => this.profileFriendship()?.state === FriendshipState.Accepted);
  readonly viewerSentRequest = computed<boolean>(() => this.profileFriendship()?.requesterUserId === this.authService.userId());
  readonly viewerCanAcceptRequest = computed<boolean>(() => !this.viewerIsProfileOwner() && this.profileFriendshipIsPending() && this.profileSentRequest());

  // Mutations

  load(profileId: string, profileData: UserProfileDTO): void {
    this._profileId.set(profileId);
    this._profile.set(profileData);
  }

  unfriend(): void {
    this._profile.update(p => p && ({ ...p, friendship: undefined }));
  }

  befriends(friendship: FriendshipDTO): void {
    this._profile.update(p => p && ({ ...p, friendship: friendship }));
  }
}
