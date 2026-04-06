import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GetGroupReqDTO, GetGroupResDTO, GroupDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PopupService } from '@gofish/shared/services/popup.service';

import { SlicePipe } from '@angular/common';
import { A } from '@angular/cdk/keycodes';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterOutlet, LoadingSpinnerComponent, RouterLinkActive],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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

  invite() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['invite'], { relativeTo: this.route });
  }

}
