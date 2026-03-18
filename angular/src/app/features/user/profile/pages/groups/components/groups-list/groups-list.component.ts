import { Component } from '@angular/core';
import { GroupsListCardComponent } from '@gofish/features/user/profile/pages/groups/components/groups-list-card/groups-list-card.component';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button/async-button.component';

@Component({
  selector: 'app-groups-list',
  imports: [GroupsListCardComponent, AsyncButtonComponent],
  templateUrl: './groups-list.component.html',
  styleUrl: '../../groups.component.css',
})
export class GroupsListComponent {

}
