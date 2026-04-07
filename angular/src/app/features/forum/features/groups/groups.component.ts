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

  protected readonly GroupRole = GroupRole;

  viewerRole = computed(() => {
    const group = this.groupData();
    const myId = this.authService.userId();

    if (!group || !myId) return null;

    const members = (group as any).members as GroupMemberDTO[];
    if (members) {
      const me = members.find((m: GroupMemberDTO) => m.userId === myId); // Corrigido para userId
      if (me) return me.role;
    }

    // 2. Fallback: Verificar se eu sou o Owner (usando userId)
    if (group.owner && group.owner.userId === myId) { // Corrigido para userId
      return GroupRole.Owner;
    }

    return null;
  });

  currentMember = computed(() => {
    const group = this.groupData();
    const myId = this.authService.userId();
    if (!group || !myId) return null;

    const members = (group as any).members as GroupMemberDTO[];
    if (members) {
      return members.find((m: GroupMemberDTO) => m.userId === myId) ?? null; // Corrigido para userId
    }

    // Se a lista de membros não existir mas eu for o Owner,
    // retorno o objeto owner do DTO
    if (group.owner && group.owner.userId === myId) {
      return group.owner;
    }

    return null;
  });

  isMember = this.viewerRole()! !== null && this.viewerRole()! >= GroupRole.Member;

  groupPopoverKey = GroupPopoverComponent.Key;

  onGroupSettingsClick(event: Event) {
    event.stopPropagation();
    this.popoverService.toggle(this.groupPopoverKey);
  }



  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.groupsService.getGroup(Number(id)).subscribe({
      next: (res) => {
        this.groupData.set(res);
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });

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
