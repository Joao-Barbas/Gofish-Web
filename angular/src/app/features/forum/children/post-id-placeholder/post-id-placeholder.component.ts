import { Component, inject, signal } from '@angular/core';
import { GroupSettingsPopoverComponent } from "../groups/components/group-settings-popover/group-settings-popover.component";
import { PostsService } from '@gofish/shared/services/posts.service';
import { CreatePostCommentReqDTO, GetPostsCommentDTO, GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO, PostIdDTO } from '@gofish/shared/dtos/get-post.dto';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PostCommentsComponent } from "../post-comments/post-comments.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-post-id-placeholder',
  imports: [GroupSettingsPopoverComponent, ForumPostComponent, PostCommentsComponent, LoadingSpinnerComponent, ReactiveFormsModule],
  templateUrl: './post-id-placeholder.component.html',
  styleUrl: './post-id-placeholder.component.css',
})
export class PostIdPlaceholderComponent {
  private readonly postService = inject(PostsService)
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  id: string | null = null;
  post = signal<GetPostsPostDTO | null>(null);
  isSubmitting = false;
  comments = signal<GetPostsCommentDTO[]>([]);

  commentForm = this.fb.group({
    body: ['', [Validators.required, Validators.maxLength(100)]]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      alert("Null id");
      return;
    };


    const dto: GetPostsReqDTO = {
      ids: [{ postId: Number(this.id) }],
      dataRequest: {
        includeAuthor: true,
        includeComments: true,
        includeGroups: true,
        includeCoords: true
      },
      lastTimestamp: new Date().toISOString(),
      maxResults: 1,
    }

    this.postService.getPosts(dto).subscribe({
      next: (res) => {
        this.post.set(res.posts[0]);
        this.comments.set(res.posts[0].comments!);
      },
      error: (err) => {
        console.log(err);
      }
    });


  }

  submitComment() {
    if (this.commentForm.invalid || this.isSubmitting) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const body = this.commentForm.controls.body.value?.trim();
    if (!body) return;

    this.isSubmitting = true;

    const dto: CreatePostCommentReqDTO = {
      postId: Number(this.id),
      body: body
    };
    this.postService.createComment(dto).subscribe({
      next: () => {
        this.commentForm.reset();
        this.isSubmitting = false;
        toast.success("Comment submitted successfully");
      },
      error: (err) => {
        console.log(err);
        this.isSubmitting = false;
        toast.error('Error submitting comment');
      }
    });
  }
}

