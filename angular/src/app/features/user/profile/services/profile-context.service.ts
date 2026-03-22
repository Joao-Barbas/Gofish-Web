import { Injectable, signal } from '@angular/core';

@Injectable()
export class ProfileContext {
  readonly profileId = signal<string>(null!);
  readonly isOwner   = signal(false);
}
