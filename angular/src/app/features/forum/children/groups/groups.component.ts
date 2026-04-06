import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GetGroupReqDTO, GetGroupResDTO, GroupDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PopupService } from '@gofish/shared/services/popup.service';
import { GroupSettingsPopoverComponent } from '@gofish/features/forum/children/groups/components/group-settings-popover/group-settings-popover.component';
import { GroupMembersPlaceholderComponent } from "./components/group-members-placeholder/group-members-placeholder.component";
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterOutlet, LoadingSpinnerComponent, GroupSettingsPopoverComponent, GroupMembersPlaceholderComponent, RouterLinkActive],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  protected groupData = signal<GroupDTO | null>(null);
  protected postActive: boolean = true;
  protected isExpanded = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const dto: GetGroupReqDTO = {
      groupId: Number(id),
      dataRequest: {
        includeMembers: true,
        includePosts: true
      }
    }
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


}
