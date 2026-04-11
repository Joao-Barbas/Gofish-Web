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

/**
 * Displays a group member card with profile information and
 * contextual management actions.
 *
 * Responsibilities:
 * - Render member identity and profile access
 * - Determine whether the current viewer can manage the member
 * - Generate a unique popover key for member settings
 * - Toggle the member settings popover
 */
@Component({
  selector: 'app-user-card',
  imports: [RouterLink, GroupMemberSettingsPopoverComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** Service used to access the currently authenticated user information. */
  readonly authService = inject(AuthService);

  /** Service used to control popover visibility. */
  readonly popoverService = inject(PopoverService);

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Exposes the settings popover component to the template. */
  readonly GroupMemberSettingsPopoverComponent = GroupMemberSettingsPopoverComponent;

  /** Group member displayed by the card. */
  member = input.required<GroupMemberDTO>();

  /** Role of the currently authenticated user within the group. */
  viewerRole = input.required<GroupRole>();

  /**
   * Indicates whether the current viewer is allowed to manage
   * the displayed member.
   *
   * A viewer can manage a member only when:
   * - The member is not the current user
   * - The viewer role is higher than the member role
   */
  canManage = computed(() => {
    const m = this.member();
    return m.userId !== this.authService.userId() && this.viewerRole() > m.role;
  });

  /**
   * Unique key used to identify the settings popover for this member.
   */
  popoverKey = computed(() => `member-settings-${this.member().userId}`);

  /**
   * Toggles the settings popover for the current member.
   *
   * @param event DOM event that triggered the action
   */
  toggleSettings(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(this.popoverKey());
  }

  /*
  popoverKey = computed(() => `${GroupMemberSettingsPopoverComponent.Key}-${this.member()?.userId}`);

  isCurrentUser = computed(() => this.member()?.userId === this.authService.userId());
  isOwner = computed(() => this.member()?.role === GroupRole.Owner);
  isModerator = computed(() => this.member()?.role === GroupRole.Moderator);

  */

  /**
   * Handles settings button clicks and toggles the settings popover.
   *
   * @param event DOM event that triggered the action
   */
  onSettingsClick(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(this.popoverKey());
  }
}
