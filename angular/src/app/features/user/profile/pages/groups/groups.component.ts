// groups.component.html

import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { LoadingSpinnerComponent } from '@gofish/shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '@gofish/shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { GroupsListComponent } from "./components/groups-list/groups-list.component";
import { GroupInvitesListComponent } from "./components/group-invites-list/group-invites-list.component";

@Component({
  selector: 'app-groups',
  imports: [
    RouterLink,
    LoadingSpinnerComponent,
    GroupsListComponent,
    GroupInvitesListComponent
],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  readonly activeTab = input<string | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=

  readonly userApi        = inject(UserApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService    = inject(AuthService);

  user = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUser(id))
  });

  constructor() { }
}
