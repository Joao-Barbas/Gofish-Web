import { filter } from 'rxjs';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { GetGroupDTO, GetGroupReqDTO, GetGroupResDTO, GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PopupService } from '@gofish/shared/services/popup.service';
import { GroupSettingsPopoverComponent } from '@gofish/features/forum/children/groups/components/group-settings-popover/group-settings-popover.component';
import { GroupMembersPlaceholderComponent } from "./components/group-members-placeholder/group-members-placeholder.component";


type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LoadingSpinnerComponent, GroupSettingsPopoverComponent, GroupMembersPlaceholderComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route= inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly popupService = inject(PopupService);
  protected groupData = signal<GetGroupResDTO | null>(null);
  protected postActive: boolean = true;


  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) return;

    const dto: GetGroupReqDTO = {
      groupId: Number(id),
      dataRequest : {
        includeMembers: true,
        includePosts: true
      }
    }
    this.groupsService.getGroup(dto).subscribe({
      next: (res) => {
        this.groupData.set(res);
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });

  }

  openOptions() {
    this.popupService.open('group-options');
  }

  toggleTab(bool: boolean) {
    this.postActive = bool;
  }

}
