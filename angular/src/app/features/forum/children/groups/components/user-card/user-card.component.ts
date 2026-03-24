import { Component, input } from '@angular/core';
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  // TODO: Rename to group-user-card
  member = input<GetGroupMemberDTO | null>(null);
}
