import { Component } from '@angular/core';
import { UserCardComponent } from "../../components/user-card/user-card.component";
import { GroupSettingsPopoverComponent } from "../../components/group-settings-popover/group-settings-popover.component"
import { GroupMemberSettingsPopoverComponent } from "../../components/group-member-settings-popover/group-member-settings-popover.component"

@Component({
  selector: 'app-group-members-placeholder',
  imports: [UserCardComponent, GroupSettingsPopoverComponent, GroupMemberSettingsPopoverComponent],
  templateUrl: './group-members-placeholder.component.html',
  styleUrl: './group-members-placeholder.component.css',
})
export class GroupMembersPlaceholderComponent {

}
