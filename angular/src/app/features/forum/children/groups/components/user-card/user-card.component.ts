import { Component, input } from '@angular/core';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  member = input<GroupMemberDTO | null>(null);
}
