import { CommonModule } from '@angular/common';
import { Component, input, inject, HostListener, ElementRef, effect, computed } from '@angular/core';
import { ProfileActionsPopoverComponent } from '@gofish/features/user/profile/pages/overview/components/profile-actions-popover/profile-actions-popover.component';
import { PopoverKey, PopoverController } from '@gofish/shared/core/popover-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { PopoverService } from '@gofish/shared/services/popover.service';
import { MouseFollowDirective } from '@gofish/shared/directives/mouse-follow.directive';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';

/**
 * Popover component that exposes management actions for a group member.
 *
 * Responsibilities:
 * - Display contextual actions for a selected group member
 * - Allow privileged users to remove members or change roles
 * - Handle ownership transfer actions
 * - Close automatically when clicking outside the popover
 */
@Component({
  selector: 'gf-group-member-settings-popover',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)': "controller.close()"
  },
  imports: [
    CommonModule,
    MouseFollowDirective,
  ],
  templateUrl: './group-member-settings-popover.component.html',
  styleUrl: './group-member-settings-popover.component.css',
})
export class GroupMemberSettingsPopoverComponent {

  /** Unique popover key used to identify this popover instance. */
  static readonly Key: PopoverKey = 'gf-group-member-settings-popover';

  /** Controller used to manage the open and close state of the popover. */
  readonly controller = new PopoverController(GroupMemberSettingsPopoverComponent.Key);

  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);

  /** Selected group member for whom actions are displayed. */
  member = input.required<GroupMemberDTO>();

  /**
   * Tooltip shown before ownership transfer.
   * Explains that the selected member will replace the current owner.
   */
  promoteToOwnerTooltip = computed(() => {
    return `This replaces you with ${this.member().userName} as owner of the group.\nThis action is permanent!`;
  });

  /** Role of the currently authenticated user within the group. */
  viewerRole = input.required<GroupRole>();

  /** Group role enum exposed to the template. */
  protected readonly Role = GroupRole;

  /** Indicates whether an action request is currently in progress. */
  isSubmitting: boolean = false;

  /**
   * Handles a generic popover action.
   *
   * @param action Name of the selected action
   */
  onAction(action: string) {
    console.log(`${action} member:`, this.member().userId);
    this.controller.close();
  }

  /**
   * Returns the current group identifier from the parent route.
   */
  private get groupId(): number {
    return Number(this.route.parent?.snapshot.paramMap.get('id'));
  }

  /**
   * Returns the identifier of the selected group member.
   */
  private get memberUserId(): string {
    return this.member().userId;
  }

  /**
   * Removes the selected member from the group.
   *
   * Behavior:
   * - Prevents duplicate submissions
   * - Validates required identifiers
   * - Displays success or error feedback
   */
  onKickMember(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    if (!this.groupId || !this.memberUserId) {
      this.isSubmitting = false;
      return;
    }

    this.groupsService.removeMember(this.groupId, this.memberUserId)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          toast.success('User removed successfully.');
          this.controller.close();
        },
        error: (err) => {
          this.isSubmitting = false;
          toast.error(err?.error ?? 'Failed to remove user.');
        }
      });
  }

  /**
   * Promotes a member to moderator or demotes a moderator to member,
   * depending on the current role of the selected user.
   *
   * Behavior:
   * - Prevents duplicate submissions
   * - Chooses the appropriate request based on current member role
   * - Displays success or error feedback
   */
  onToggleModerator(): void {
    if (this.isSubmitting) return;

    if (!this.groupId || !this.memberUserId) {
      this.isSubmitting = false;
      return;
    }

    const request$ = this.member().role === GroupRole.Moderator
      ? this.groupsService.demoteAdminToMember(this.groupId, this.memberUserId)
      : this.groupsService.promoteMemberToAdmin(this.groupId, this.memberUserId);

    this.isSubmitting = true;

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        toast.success(
          this.member().role === GroupRole.Moderator
            ? 'User demoted to member.'
            : 'User promoted to moderator.'
        );
        this.controller.close();
      },
      error: (err) => {
        this.isSubmitting = false;
        toast.error(err?.error ?? 'Failed to update role.');
      }
    });
  }

  /**
   * Transfers group ownership to the selected member.
   *
   * Behavior:
   * - Prevents duplicate submissions
   * - Validates required identifiers
   * - Displays success or error feedback
   */
  onPromoteToOwner(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (!this.groupId || !this.memberUserId) {
      this.isSubmitting = false;
      return;
    }

    this.groupsService.promoteMemberToOwner(this.groupId, this.memberUserId)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          toast.success('Ownership transferred successfully.');
          this.controller.close();
        },
        error: (err) => {
          this.isSubmitting = false;
          toast.error(err?.error ?? 'Failed to transfer ownership.');
        }
      });
  }
}
