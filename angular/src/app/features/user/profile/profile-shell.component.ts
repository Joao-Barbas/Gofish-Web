// profile-shell.component.ts

import { Component, effect, inject, input, resource } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "@gofish/shared/services/auth.service";
import { ProfileContext } from "@gofish/features/user/profile/services/profile-context.service";
import { catchError, firstValueFrom, forkJoin, map, of } from "rxjs";
import { UserApi } from "@gofish/shared/api/user.api";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";
import { rxResource } from "@angular/core/rxjs-interop";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { Path, PathSegment } from "@gofish/shared/constants";
import { toast } from "ngx-sonner";
import { UserProfileApi } from "@gofish/shared/api/user-profile.api";

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, LoadingSpinnerComponent, LoadingErrorModalComponent],
  providers: [ProfileContext],
  templateUrl: './profile-shell.component.html',
  styleUrl: './profile-shell.component.css',
})
export class ProfileShellComponent {
  readonly profileId = input<string | undefined>(undefined, { alias: 'id' }); // Signal-based input given from :id

  readonly authService    = inject(AuthService);
  readonly router         = inject(Router);
  readonly profileContext = inject(ProfileContext);
  readonly userProfileApi = inject(UserProfileApi);

  Path = Path;
  PathSegment = PathSegment;
  window = window;
  toast = toast;

  userProfileData = rxResource({
    params: () => this.profileId(),
    stream: ({ params: id }) => this.userProfileApi.getUserProfile(id)
  });

  constructor() {
    effect(() => {
      if (this.profileId()) return;
      this.toast.warning('Profile requires a route :id param.');
      this.router.navigate([Path.HOME]);
    });
    effect(() => {
      let id   = this.profileId();
      let data = this.userProfileData.value();
      if (!id || !data) return;
      this.profileContext.load(id, data);
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
