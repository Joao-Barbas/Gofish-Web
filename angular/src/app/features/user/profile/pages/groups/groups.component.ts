// groups.components.ts

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '@gofish/features/footer/footer.component';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { GroupInvitesListComponent } from '@gofish/features/user/profile/pages/groups/components/group-invites-list/group-invites-list.component';
import { GroupsListComponent } from '@gofish/features/user/profile/pages/groups/components/groups-list/groups-list.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-groups',
  imports: [
    RouterLink,
    FlatHeaderComponent,
    GroupsListComponent,
    GroupInvitesListComponent,
    FooterComponent
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private route = inject(ActivatedRoute);

  public activeTab = toSignal(
    this.route.queryParams.pipe(map(p => p['tab'] ?? 'groups')),
    { initialValue: 'groups' }
  );
}
