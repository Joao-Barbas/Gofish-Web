import { Component, inject, input } from '@angular/core';
import { GetPostsCommentDTO } from '@gofish/shared/dtos/get-post.dto';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { CommentDto } from '@gofish/shared/dtos/pin.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PinService } from '@gofish/shared/services/pin.service';
import { Router } from '@angular/router';
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';

/**
 * Displays the list of comments associated with a post and provides
 * actions such as deleting or reporting individual comments.
 *
 * Responsibilities:
 * - Render post comments in the UI
 * - Expose current user permissions to the template
 * - Navigate to delete and report comment flows
 */
@Component({
  selector: 'app-post-comments',
  imports: [TimeAgoPipe, LoadingSpinnerComponent, UserTitleComponent],
  templateUrl: './post-comments.component.html',
  styleUrl: './post-comments.component.css',
})
export class PostCommentsComponent {
  private readonly router = inject(Router);

  /** Service used to resolve avatar image URLs. */
  protected readonly avatarService = inject(AvatarService);

  private readonly authService = inject(AuthService);

  /** Username of the currently authenticated user. */
  userName = this.authService.getUserName();

  /** Indicates whether the current user has administrator privileges. */
  isAdmin = this.authService.isAdmin();

  /** List of comments to display. */
  comments = input<CommentDto[]>([]);

  /**
   * Navigates to the delete comment flow for the selected comment.
   *
   * @param commentId Identifier of the comment to delete
   */
  deleteComment(commentId: number) {
    this.router.navigate(['forum', 'delete-comment', commentId]);
  }

  /**
   * Navigates to the report comment flow for the selected comment.
   *
   * @param id Identifier of the comment to report
   */
  report(id: number) {
    this.router.navigate(['forum', 'report-comment', id]);
  }
}
