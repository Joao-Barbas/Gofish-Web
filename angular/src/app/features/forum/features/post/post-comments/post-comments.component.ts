import { Component, inject, input } from '@angular/core';
import { GetPostsCommentDTO } from '@gofish/shared/dtos/get-post.dto';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { CommentDto } from '@gofish/shared/dtos/pin.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PinService } from '@gofish/shared/services/pin.service';
import { Router, RouterLink } from '@angular/router';
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { Path } from '@gofish/shared/constants';

@Component({
  selector: 'app-post-comments',
  imports: [TimeAgoPipe, LoadingSpinnerComponent, UserTitleComponent, RouterLink],
  templateUrl: './post-comments.component.html',
  styleUrl: './post-comments.component.css',
})
export class PostCommentsComponent {
  private readonly router = inject(Router);
  protected readonly avatarService = inject(AvatarService);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  comments = input<CommentDto[]>([]);
  Path=Path;

  deleteComment(commentId: number) {
    this.router.navigate(['forum', 'delete-comment', commentId]);
  }

  report(id: number) {
    this.router.navigate(['forum', 'report-comment', id]);
  }
}
