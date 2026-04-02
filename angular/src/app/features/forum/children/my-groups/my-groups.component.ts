import { Component, inject, signal } from '@angular/core';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { RouterLink } from "@angular/router";
import { Path, PathSegment } from '@gofish/shared/constants';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-my-groups',
  imports: [RouterLink, SlicePipe],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css',
})
export class MyGroupsComponent {
  protected readonly Path = Path;
  protected readonly PathSegment = PathSegment;
  private readonly groupsService = inject(GroupsService);
  groups = signal<GetUserGroupsResDTO | null>(null);

  ngOnInit() {
    this.groupsService.getUserGroups().subscribe({
      next: (res) => {
        this.groups.set(res);
        console.log('groups', res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}
