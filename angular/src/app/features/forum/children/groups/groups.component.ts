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


type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LoadingSpinnerComponent, GroupSettingsPopoverComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route= inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly router = inject(Router);
  private readonly popupService = inject(PopupService);
  public currentPath: WritableSignal<string> = signal(this.router.url);
  groupData = signal<GetGroupResDTO | null>(null);

  public navPaths: NavPath[] = [
    { path: 'group-post-redirect-testing', label: 'Posts' },
    { path: Path.FORUM_GROUPS_test_members, label: 'Members' },
  ];

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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event: NavigationEnd) => {
      this.currentPath.set(event.urlAfterRedirects);
    });
  }

  public onNavSelectChange(event: Event) {
    var select = event.target as HTMLSelectElement;
    this.router.navigate([select.value]);
  }

  openOptions() {
    this.popupService.open('group-options');
  }
}
