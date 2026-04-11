import { Component, inject, signal } from '@angular/core';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { RouterLink } from "@angular/router";
import { Path, PathSegment } from '@gofish/shared/constants';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { SlicePipe } from '@angular/common';
import { LoadingSpinnerComponent } from '@gofish/shared/components/loading-spinner/loading-spinner.component';

/**
 * Displays the list of groups that the current user belongs to.
 *
 * Responsibilities:
 * - Fetch user groups from the backend
 * - Store and expose group data to the template
 * - Provide navigation paths to group-related pages
 */
@Component({
  selector: 'app-my-groups',
  imports: [RouterLink, SlicePipe, LoadingSpinnerComponent],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css',
})
export class MyGroupsComponent {
  /** Shared route path constants used in templates. */
  protected readonly Path = Path;

  /** Path segment constants used for navigation. */
  protected readonly PathSegment = PathSegment;

  private readonly groupsService = inject(GroupsService);

  /** Stores the list of groups the current user belongs to. */
  groups = signal<GetUserGroupsResDTO | null>(null);

  /**
   * Loads the groups associated with the current user.
   */
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
