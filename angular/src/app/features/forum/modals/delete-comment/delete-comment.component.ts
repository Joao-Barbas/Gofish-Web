import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { toast } from 'ngx-sonner';

/**
 * Confirmation component used to delete an existing comment.
 *
 * Responsibilities:
 * - Read the target comment identifier from the route
 * - Allow the user to cancel the deletion flow
 * - Submit the delete request to the backend
 */
@Component({
  selector: 'gf-delete-comment',
  imports: [],
  templateUrl: './delete-comment.component.html',
  styleUrl: './delete-comment.component.css',
})
export class DeleteCommentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);

  /** Identifier of the comment selected for deletion. */
  private commentId: number | null = null;

  /**
   * Loads the comment identifier from the current route.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    }

    this.commentId = Number(id);
  }

  /**
   * Cancels the delete flow and navigates back to the forum page.
   */
  cancel() {
    this.router.navigate(['forum']);
  }

  /**
   * Sends the delete request for the selected comment.
   * Displays success or error feedback and returns to the forum page.
   */
  confirmDelete() {
    if (!this.commentId) return;

    this.pinService.deleteComment(this.commentId).subscribe({
      next: () => {
        toast.success('Deleted comment successfully');
      },
      error: (err) => {
        toast.error('You dont have permissions to delete this comment' + err);
      }
    });

    this.router.navigate(['forum']);
  }
}
