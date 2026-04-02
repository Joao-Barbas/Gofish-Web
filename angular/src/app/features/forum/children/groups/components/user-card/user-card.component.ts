import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  readonly avatarService = inject(AvatarService);
  member = input<GroupMemberDTO | null>(null);
  readonly Path = Path;

}
