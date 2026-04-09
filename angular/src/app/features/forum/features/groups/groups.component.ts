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
  protected groupData = signal<GroupDTO | null>(null);
  protected postActive: boolean = true;
  protected isExpanded = false;
  protected readonly Path = Path;

  protected readonly mockOwner = MOCK_OWNER;

  protected readonly GroupRole = GroupRole;

  viewerRole = computed(() => {
    const group = this.groupData();
    const myId = this.authService.userId();

    if (!myId) return null;

    // TESTE: Se você for o player1 (Mock), libera como Owner
    if (this.mockOwner.userId === myId) return GroupRole.Owner;

    if (!group) return null;

    // Lógica real: verifica o dono e membros
    // Nota: Usei 'any' para aceitar 'Owner' ou 'owner' vindo do backend
    const owner = (group as any).owner || (group as any).Owner;
    if (owner && String(owner.userId) === String(myId)) {
      return GroupRole.Owner;
    }

    const members = (group as any).members || (group as any).Members;
    if (members && Array.isArray(members)) {
      const me = members.find((m: any) => String(m.userId) === String(myId));
      if (me) return me.role;
    }

    return null;
  });

  isMember = computed(() => {
    const role = this.viewerRole();
    return role !== null && role >= GroupRole.Member;
  });

  currentMember = computed(() => {
    const group = this.groupData();
    const myId = this.authService.userId();
    if (!myId) return null;
    if (this.mockOwner.userId === myId) return this.mockOwner;

    if (!group) return null;
    const owner = (group as any).owner || (group as any).Owner;
    if (owner && String(owner.userId) === String(myId)) return owner;

    return null;
  });

  groupPopoverKey = GroupPopoverComponent.Key;




  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.groupsService.getGroup(Number(id)).subscribe({
      next: (res: any) => {
        // Se a API retornar { group: {...} }, pegamos o .group, senão o res
        const data = res.group ? res.group : res;
        this.groupData.set(data);
      },
      error: (err) => console.error(err)
    });
  }

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
