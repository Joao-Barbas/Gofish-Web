import { Component, inject, signal } from '@angular/core';
import { GroupSettingsPopoverComponent } from "../groups/components/group-settings-popover/group-settings-popover.component";
import { CreatePostCommentReqDTO, GetPostsCommentDTO, GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO, PostIdDTO } from '@gofish/shared/dtos/get-post.dto';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PostCommentsComponent } from "../post-comments/post-comments.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { PinService } from '@gofish/shared/services/pin.service';
import { CommentDto, CreateCommentReqDto, GetCommentsReqDto, GetCommentsResDto, GetPinsReqDto, PinDto } from '@gofish/shared/dtos/pin.dto';

@Component({
  selector: 'app-post-id-placeholder',
  imports: [GroupSettingsPopoverComponent, ForumPostComponent, PostCommentsComponent, LoadingSpinnerComponent, ReactiveFormsModule],
  templateUrl: './post-id-placeholder.component.html',
  styleUrl: './post-id-placeholder.component.css',
})
export class PostIdPlaceholderComponent {
  private readonly pinService = inject(PinService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  id: string | null = null;
  post = signal<PinDto | null>(null);
  isSubmitting = false;
  comments = signal<GetCommentsResDto | null>(null);

  commentForm = this.fb.group({
    body: ['', [Validators.required, Validators.maxLength(100)]]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      alert("Null id");
      return;
    };
    
    const dto: GetPinsReqDto = {
      ids: [{ pinId: Number(this.id) }],
      dataRequest: {
        includeGeolocation: true,
        includeAuthor: true,
        includeDetails: true,
        includeStats: true,
        includeUgc: true
      },
      maxResults: 1,
    }

    this.pinService.getPins(dto).subscribe({
      next: (res) => {
        this.post.set(res.pins[0]);
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.loadComments();
  }

  loadComments() {
    if (!this.id) return;

    const req: GetCommentsReqDto = {
      pinId: Number(this.id),
      maxResults: 5,
    };

    this.pinService.getComments(req).subscribe({
      next: (res) => {
        this.comments.update(current => {
          if (!current) return res;

          return {
            ...res,
            comments: [...current.comments, ...res.comments]
          };
        });
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

    const dto: CreateCommentReqDto = {
      pinId: Number(this.id),
      body: body
    };
    this.pinService.createComment(dto).subscribe({
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

