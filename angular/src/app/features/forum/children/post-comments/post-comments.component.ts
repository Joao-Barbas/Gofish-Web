import { Component, input } from '@angular/core';
import { GetPostsCommentDTO } from '@gofish/shared/dtos/get-post.dto';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { CommentDto } from '@gofish/shared/dtos/pin.dto';

@Component({
  selector: 'app-post-comments',
  imports: [TimeAgoPipe, LoadingSpinnerComponent],
  templateUrl: './post-comments.component.html',
  styleUrl: './post-comments.component.css',
})
export class PostCommentsComponent {
  comments = input<CommentDto[]>([]);


}
