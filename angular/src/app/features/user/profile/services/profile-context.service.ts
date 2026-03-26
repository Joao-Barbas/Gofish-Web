import { Injectable, signal } from '@angular/core';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';

@Injectable()
export class ProfileContext {
  readonly profileId  = signal<string>(null!);
  readonly isOwner    = signal<boolean>(false);
  readonly isFriend   = signal<boolean>(false);
  readonly friendship = signal<FriendshipDTO | null | undefined>(null);

  /*

  // Private writable signals
  private readonly _profileId = signal<string | null>(null);
  private readonly _isOwner = signal(false);

  // Public read-only access — prevents components from
  // accidentally doing profileId.set() from the outside
  readonly profileId = this._profileId.asReadonly();
  readonly isOwner = this._isOwner.asReadonly();

  // Derived state — free reactivity
  readonly canEdit = computed(() => this._isOwner() && this._profileId() !== null);

  // Controlled mutations
  load(profileId: string, isOwner: boolean) {
    this._profileId.set(profileId);
    this._isOwner.set(isOwner);
  }

  clear() {
    this._profileId.set(null);
    this._isOwner.set(false);
  }

  */
}
