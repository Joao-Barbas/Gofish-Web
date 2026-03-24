import { filter } from 'rxjs';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { GetGroupDTO, GetGroupReqDTO, GetGroupResDTO, GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';


type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  private readonly route= inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly router: Router = inject(Router);
  public currentPath: WritableSignal<string> = signal(this.router.url);
  group = signal<GetGroupResDTO | null>(null);

  public navPaths: NavPath[] = [
    { path: 'group-post-redirect-testing', label: 'Posts' },
    { path: Path.FORUM_GROUPS_test_members, label: 'Members' },
  ];

  constructor() {
    const id = this.route.snapshot.queryParamMap.get('id');
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
        this.group.set(res);
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
}
