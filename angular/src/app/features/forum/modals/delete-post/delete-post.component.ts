import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { toast } from 'ngx-sonner';

/**
 * Confirmation component used to delete an existing post.
 *
 * Responsibilities:
 * - Retrieve the post identifier from the route
 * - Allow the user to cancel the deletion flow
 * - Submit the delete request to the backend
 */
@Component({
  selector: 'gf-delete-post',
  imports: [],
  templateUrl: './delete-post.component.html',
  styleUrl: './delete-post.component.css',
})
export class DeletePostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);

  /** Identifier of the post selected for deletion. */
  private postId: number | null = null;

  /**
   * Loads the post identifier from the current route.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    }

    this.postId = Number(id);
  }

  /**
   * Cancels the delete flow and navigates back to the forum page.
   */
  cancel() {
    this.router.navigate(['forum']);
  }

  /**
   * Sends the delete request for the selected post.
   * Displays success or error feedback and returns to the forum page.
   */
  confirmDelete() {
    if (!this.postId) return;

    this.pinService.deletePin(this.postId).subscribe({
      next: () => {
        toast.success('Deleted post succesfully');
      },
      error: (err) => {
        alert('You dont have permissions do delete this post');
      }
    });

    this.router.navigate(['forum']);
  }
}
