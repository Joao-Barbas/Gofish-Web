import { Component, inject } from '@angular/core';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';

/**
 * Confirmation component used to leave a group.
 *
 * Responsibilities:
 * - Retrieve the group identifier from the parent route
 * - Allow the user to cancel the exit flow
 * - Submit the leave group request to the backend
 */
@Component({
  selector: 'gf-exit-group',
  imports: [],
  templateUrl: './exit-group.component.html',
  styleUrl: './exit-group.component.css',
})
export class ExitGroupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);

  /** Identifier of the group the user wants to leave. */
  private groupId: number | null = null;

  /**
   * Loads the group identifier from the parent route.
   */
  ngOnInit() {
    const id = this.route.parent?.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    }

    this.groupId = Number(id);
  }

  /**
   * Cancels the exit flow and navigates back to the forum page.
   */
  cancel() {
    this.router.navigate(['forum']);
  }

  /**
   * Sends the request to leave the selected group.
   * Displays success or error feedback and returns to the forum page.
   */
  confirmDelete() {
    if (!this.groupId) return;

    this.groupsService.leaveGroup(this.groupId).subscribe({
      next: () => {
        toast.success('Left group succesfully');
      },
      error: (err) => {
        toast.error('You dont have permissions to leave this group');
        console.log(err);
      }
    });

    this.router.navigate(['forum']);
  }
}
