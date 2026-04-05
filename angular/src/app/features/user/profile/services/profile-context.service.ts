// profile-context.service.ts

import { computed, inject, Injectable, signal } from '@angular/core';
import { GetUserProfileResDTO, UserProfileDTO } from '@gofish/shared/dtos/user-profile.dto';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserManagerService } from '@gofish/shared/services/user-manager.service';

@Injectable()
export class ProfileContext {
  private readonly userManagerService = inject(UserManagerService);
  private readonly authService = inject(AuthService);

  // Signals

  private _userProfileId = signal<string>(null!);
  readonly userProfileId = this._userProfileId.asReadonly();

  private _userProfile = signal<UserProfileDTO>(null!);
  readonly userProfile = this._userProfile.asReadonly();

  // Computed

  readonly isOwner  = computed<boolean>(() => this._userProfileId() === this.authService.userId())
  readonly isFriend = computed<boolean>(() => this._userProfile().friendship?.state === FriendshipState.Accepted);

  // Mutations

  load(profileId: string, profileData: UserProfileDTO): void {
    this._userProfileId.set(profileId);
    this._userProfile.set(profileData);
  }

  unfriend(): void {
    this._userProfile.update(p => p && ({ ...p, friendship: undefined }));
  }

  befriends(friendship: FriendshipDTO): void {
    this._userProfile.update(p => p && ({ ...p, friendship: friendship }));
  }
}
