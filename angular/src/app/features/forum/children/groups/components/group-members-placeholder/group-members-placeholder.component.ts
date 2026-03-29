import { Component, input, signal } from '@angular/core';
import { UserCardComponent } from "../user-card/user-card.component";
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';

@Component({
  selector: 'app-group-members-placeholder',
  imports: [],
  templateUrl: './group-members-placeholder.component.html',
  styleUrl: './group-members-placeholder.component.css',
})
export class GroupMembersPlaceholderComponent {
  members = input<GetGroupMemberDTO[]>([]);
}
