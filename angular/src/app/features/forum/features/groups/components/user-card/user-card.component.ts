import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GetGroupMemberDTO } from '@gofish/shared/dtos/members.dto';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { PopoverService } from '@gofish/shared/services/popover.service';
import { GroupMemberSettingsPopoverComponent } from "../group-member-settings-popover/group-member-settings-popover.component";

@Component({
  selector: 'app-user-card',
  imports: [RouterLink, GroupMemberSettingsPopoverComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  readonly avatarService = inject(AvatarService);
  readonly authService = inject(AuthService);
  readonly popoverService = inject(PopoverService);

  readonly GroupMemberSettingsPopoverComponent = GroupMemberSettingsPopoverComponent
  readonly Path = Path;


  member = input<GroupMemberDTO | null>(null);

  popoverKey = computed(() => `${GroupMemberSettingsPopoverComponent.Key}-${this.member()?.userId}`);

  isCurrentUser = computed(() => this.member()?.userId === this.authService.userId());
  isOwner = computed(() => this.member()?.role === GroupRole.Owner);
  isModerator = computed(() => this.member()?.role === GroupRole.Moderator);

  onSettingsClick(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(this.popoverKey());
  }

}

