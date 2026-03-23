// profile-shell.component.ts

import { Component, computed, effect, inject, input, resource } from "@angular/core";
import { FlatHeaderComponent } from "@gofish/features/header/flat-header/flat-header.component";
import { FooterComponent } from "@gofish/features/footer/footer.component";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { AuthService } from "@gofish/shared/services/auth.service";
import { ProfileContext } from "@gofish/features/user/profile/services/profile-context.service";

@Component({
  selector: 'app-profile',
  imports: [
    FlatHeaderComponent,
    RouterOutlet,
    FooterComponent,
  ],
  providers: [
    ProfileContext
  ],
  templateUrl: './profile-shell.component.html',
  styleUrl: './profile-shell.component.css',
})
export class ProfileShellComponent {
  readonly profileId = input<string | undefined>(undefined, { alias: 'id' }); // Signal-based input given from :id

  private readonly authService    = inject(AuthService);
  private readonly profileContext = inject(ProfileContext);

  constructor() {
    effect(() => {
      if (!this.profileId()) throw new Error('Profile requires a route :id param.');
      this.profileContext.profileId.set(this.profileId()!);
      this.profileContext.isOwner.set(this.profileId() === this.authService.userId());
    });
  }
}

// friends.component.ts
// export class FriendsComponent {
//   private ctx = inject(ProfileContext);
//   private friendsService = inject(FriendsService);
//
//   friends = resource({
//     params: () => this.ctx.id(),
//     loader: ({ params: id }) => this.friendsService.getFriends(id!)
//   });
//
//   // Only shown if owner
//   friendRequests = resource({
//     params: () => this.ctx.isOwner() ? this.ctx.id() : undefined,
//     loader: ({ params: id }) => this.friendsService.getRequests(id!)
//   });
// }

// groups.component.ts
// export class GroupsComponent {
//   private ctx = inject(ProfileContext);
//
//   groups = resource({
//     params: () => this.ctx.id(),
//     loader: ({ params: id }) => this.groupsService.getGroups(id!)
//   });
//
//   // Only fetches for the profile owner
//   invites = resource({
//     params: () => this.ctx.isOwner() ? this.ctx.id() : undefined,
//     loader: ({ params: id }) => this.groupsService.getInvites(id!)
//   });
// }
