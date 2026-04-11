import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';

/**
 * Confirmation component used to delete an existing group.
 *
 * Responsibilities:
 * - Retrieve the group identifier from the parent route
 * - Allow the user to cancel the deletion flow
 * - Submit the delete request to the backend
 */
@Component({
  selector: 'gf-delete-group',
  imports: [],
  templateUrl: './delete-group.component.html',
  styleUrl: './delete-group.component.css',
})
export class DeleteGroupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupsService);

  /** Identifier of the group selected for deletion. */
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
   * Cancels the delete flow and navigates back to the forum page.
   */
  cancel() {
    this.router.navigate(['forum']);
  }

  /**
   * Sends the delete request for the selected group.
   * Displays success or error feedback and returns to the forum page.
   */
  confirmDelete() {
    if (!this.groupId) return;

    this.groupService.deleteGroup(this.groupId).subscribe({
      next: () => {
        toast.success('Deleted group succesfully');
      },
      error: (err) => {
        alert('You dont have permissions to delete this group');
      }
    });

    this.router.navigate(['forum']);
  }
}
