import { Component, inject, input } from '@angular/core';
import { GetPostsCommentDTO } from '@gofish/shared/dtos/get-post.dto';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { CommentDto } from '@gofish/shared/dtos/pin.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-post-comments',
  imports: [TimeAgoPipe, LoadingSpinnerComponent],
  templateUrl: './post-comments.component.html',
  styleUrl: './post-comments.component.css',
})
export class PostCommentsComponent {
  protected readonly avatarService = inject(AvatarService);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  comments = input<CommentDto[]>([]);


}
