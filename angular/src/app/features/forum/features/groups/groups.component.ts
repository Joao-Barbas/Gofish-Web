import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GetGroupReqDTO, GetGroupResDTO, GroupDTO, GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";

import { SlicePipe } from '@angular/common';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopoverService } from '@gofish/shared/services/popover.service';
import { GroupPopoverComponent } from '@gofish/features/forum/features/groups/components/group-popover/group-popover.component';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { Path } from '@gofish/shared/constants';

/**
 * Fallback owner data used when a mock or placeholder group owner
 * is needed by the component or template.
 */
const MOCK_OWNER: GroupMemberDTO = {
  userId: 'seed-player-1',
  userName: 'player1',
  displayName: 'player1',
  avatarUrl: '',
  role: GroupRole.Owner,
  joinedAt: new Date().toISOString()
};

/**
 * Displays a group's main page and exposes the group overview state,
 * membership information, and navigation to group-related actions.
 *
 * Responsibilities:
 * - Load group data from the backend
 * - Expose group membership and role information
 * - Toggle expanded group content sections
 * - Open the group settings popover
 * - Navigate to group actions such as invitation flows
 */
@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterOutlet, LoadingSpinnerComponent, RouterLinkActive, GroupPopoverComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly authService = inject(AuthService);
  protected readonly popoverService = inject(PopoverService);
  private readonly router = inject(Router);

  /** Indicates whether the posts tab is currently active. */
  protected postActive: boolean = true;

  /** Controls whether expandable content is currently expanded. */
  protected isExpanded = false;

  /** Shared route path constants used in templates. */
  protected readonly Path = Path;

  /** Fallback mock owner exposed to the template. */
  protected readonly mockOwner = MOCK_OWNER;

  /** Group role enum exposed to the template. */
  protected readonly GroupRole = GroupRole;

  /** Stores the currently loaded group data. */
  protected groupData = signal<GroupDTO | null>(null);

  /**
   * Indicates whether the current authenticated user is a member of the group.
   */
  isMember = computed(() => {
    return this.groupData()?.isCurrentUserMember ?? false;
  });

  /**
   * Returns the role of the current authenticated user within the group.
   */
  viewerRole = computed<GroupRole | null>(() => {
    return this.groupData()?.currentUserMembership?.role ?? null;
  });

  /**
   * Returns the membership information of the current authenticated user.
   */
  currentMember = computed<GroupMemberDTO | null>(() => {
    return this.groupData()?.currentUserMembership ?? null;
  });

  /**
   * Loads the group data using the identifier from the current route.
   */
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.groupsService.getGroup(Number(id)).subscribe({
      next: (res: any) => {
        // Se a API retornar { group: {...} }
        const data = res.group ? res.group : res;
        this.groupData.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  /** Popover key used to identify the group settings popover. */
  groupPopoverKey = GroupPopoverComponent.Key;

  /**
   * Opens or closes the group settings popover.
   *
   * @param event DOM event that triggered the action
   */
  onGroupSettingsClick(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(GroupPopoverComponent.Key);
  }

  /**
   * Toggles the expanded state of the group content.
   */
  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * Navigates to the invite page for the current group.
   */
  invite() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['invite'], { relativeTo: this.route });
  }
}
