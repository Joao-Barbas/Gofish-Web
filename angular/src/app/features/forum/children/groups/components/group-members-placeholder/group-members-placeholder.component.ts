import { Component, input, signal } from '@angular/core';
import { UserCardComponent } from "../user-card/user-card.component";
import { GroupSettingsPopoverComponent } from "../group-settings-popover/group-settings-popover.component"
import { GroupMemberSettingsPopoverComponent } from "../group-member-settings-popover/group-member-settings-popover.component"
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';

@Component({
  selector: 'app-group-members-placeholder',
  imports: [UserCardComponent, GroupSettingsPopoverComponent, GroupMemberSettingsPopoverComponent],
  templateUrl: './group-members-placeholder.component.html',
  styleUrl: './group-members-placeholder.component.css',
})
export class GroupMembersPlaceholderComponent {
  members = input<GetGroupMemberDTO[]>([]);

}
