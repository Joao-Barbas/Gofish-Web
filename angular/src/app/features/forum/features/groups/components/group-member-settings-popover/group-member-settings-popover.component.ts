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

  static readonly Key: PopoverKey = 'gf-group-member-settings-popover';
  readonly controller = new PopoverController(GroupMemberSettingsPopoverComponent.Key);
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);

  member = input.required<GroupMemberDTO>();

  promoteToOwnerTooltip = computed(() => {
    return `This replaces you with ${this.member().userName} as owner of the group.\nThis action is permanent!`;
  });

  viewerRole = input.required<GroupRole>();

  protected readonly Role = GroupRole;
  isSubmitting: any;

  // Métodos de ação (exemplo)
  onAction(action: string) {
    console.log(`${action} member:`, this.member().userId);
    this.controller.close();
  }

  private get groupId(): number {
    return Number(this.route.parent?.snapshot.paramMap.get('id'));
  }

  private get memberUserId(): string {
    return this.member().userId;
  }

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
  onToggleModerator(): void {
    if (this.isSubmitting) return;

    const request$ = this.member().role === GroupRole.Moderator
      ? this.groupsService.demoteAdminToMember(this.groupId, this.memberUserId)
      : this.groupsService.promoteMemberToAdmin(this.groupId, this.memberUserId);

    this.isSubmitting = true;

    if (!this.groupId || !this.memberUserId) {
      this.isSubmitting = false;
      return;
    }

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
