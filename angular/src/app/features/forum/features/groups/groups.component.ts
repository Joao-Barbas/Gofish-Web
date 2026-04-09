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

const MOCK_OWNER: GroupMemberDTO = {
  userId: 'seed-player-1',
  userName: 'player1',
  displayName: 'player1',
  avatarUrl: '',
  role: GroupRole.Owner,
  joinedAt: new Date().toISOString()
};

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
  protected postActive: boolean = true;
  protected isExpanded = false;
  protected readonly Path = Path;

  protected readonly mockOwner = MOCK_OWNER;

  protected readonly GroupRole = GroupRole;


  protected groupData = signal<GroupDTO | null>(null);


  isMember = computed(() => {
    return this.groupData()?.isCurrentUserMember ?? false;
  });

  viewerRole = computed<GroupRole | null>(() => {
    return this.groupData()?.currentUserMembership?.role ?? null;
  });

  currentMember = computed<GroupMemberDTO | null>(() => {
    return this.groupData()?.currentUserMembership ?? null;
  });

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



  groupPopoverKey = GroupPopoverComponent.Key;



  // ... (outros métodos toggleExpand, etc)
  onGroupSettingsClick(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(GroupPopoverComponent.Key);
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  invite() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['invite'], { relativeTo: this.route });
  }




}
