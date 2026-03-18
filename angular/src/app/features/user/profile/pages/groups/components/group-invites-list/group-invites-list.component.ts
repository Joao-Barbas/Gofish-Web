import { Component } from '@angular/core';
import { GroupsListCardComponent } from '@gofish/features/user/profile/pages/groups/components/groups-list-card/groups-list-card.component';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button/async-button.component';

@Component({
  selector: 'app-group-invites-list',
  imports: [GroupsListCardComponent, AsyncButtonComponent],
  templateUrl: './group-invites-list.component.html',
  styleUrl: '../../groups.component.css',
})
export class GroupInvitesListComponent {

}
