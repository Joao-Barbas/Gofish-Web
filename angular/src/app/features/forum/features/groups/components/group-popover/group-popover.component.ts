import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupMemberSettingsPopoverComponent } from '@gofish/features/forum/features/groups/components/group-member-settings-popover/group-member-settings-popover.component';
import { PopoverKey, PopoverController } from '@gofish/shared/core/popover-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { MouseFollowDirective } from '@gofish/shared/directives/mouse-follow.directive';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { GroupsService } from '@gofish/shared/services/groups.service';

/**
 * Popover component that exposes group-level actions such as inviting
 * members, deleting the group, leaving the group, or navigating to
 * related group actions.
 *
 * Responsibilities:
 * - Display contextual actions for the current group
 * - Navigate to group management flows
 * - Allow the current user to leave the group
 * - Close when clicking outside the popover
 */
@Component({
  selector: 'gf-group-popover',
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
  imports: [CommonModule,
    MouseFollowDirective],
  templateUrl: './group-popover.component.html',
  styleUrl: './group-popover.component.css',
})
export class GroupPopoverComponent {
  /** Unique popover key used to identify this popover instance. */
  static readonly Key: PopoverKey = 'gf-group-settings-popover';

  /** Controller used to manage the open and close state of the popover. */
  readonly controller = new PopoverController(GroupPopoverComponent.Key);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);

  /** Role of the currently authenticated user within the group. */
  viewerRole = input.required<GroupRole>();

  /** Current group member associated with the displayed actions. */
  member = input.required<GroupMemberDTO>();

  /** Group role enum exposed to the template. */
  protected readonly Role = GroupRole;

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
   * Navigates to the invite flow for the current group.
   */
  invite() {
    this.controller.close();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['invite'], { relativeTo: this.route });
  }

  /**
   * Navigates to the delete group flow.
   */
  deleteGroup() {
    this.router.navigate(['delete'], { relativeTo: this.route });
  }

  /**
   * Removes the current user from the group after confirmation.
   * If successful, redirects the user to the group list page.
   */
  leaveGroup() {
    const groupId = Number(this.route.snapshot.paramMap.get('id'));
    const userId = this.member().userId;

    if (!groupId || !userId) return;

    // Confirmar antes de sair (opcional mas recomendado)
    if (confirm('Are you sure you want to leave this crew?')) {
      this.groupsService.removeMember(groupId, userId).subscribe({
        next: () => {
          this.controller.close();
          // Redirecionar para a lista de grupos, já que ele já não tem acesso a este
          this.router.navigate(['/forum/my-crews']);
        },
        error: (err) => {
          console.error('Error leaving group:', err);
        }
      });
    }
  }

  /**
   * Navigates to the exit flow for the current group.
   */
  exit() {
    this.router.navigate(['exit'], { relativeTo: this.route });
  }
}
