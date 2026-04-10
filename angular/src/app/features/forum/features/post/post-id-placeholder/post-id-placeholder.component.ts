import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { AuthService } from '@gofish/shared/services/auth.service';

import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { PinService } from '@gofish/shared/services/pin.service';
import { CommentDto, CreateCommentReqDto, GetCommentsReqDto, GetCommentsResDto, GetPinsReqDto, PinDto } from '@gofish/shared/dtos/pin.dto';
import { BusyState } from '@gofish/shared/core/busy-state';
import { BodyLengthConstraints } from '@gofish/shared/constants';
import { PostCommentsComponent } from '@gofish/features/forum/features/post/post-comments/post-comments.component';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";

@Component({
  selector: 'app-post-id-placeholder',
  imports: [
    ForumPostComponent,
    PostCommentsComponent,
    LoadingSpinnerComponent,
    ReactiveFormsModule,
    AsyncButtonComponent
],
  templateUrl: './post-id-placeholder.component.html',
  styleUrl: './post-id-placeholder.component.css',
})
export class PostIdPlaceholderComponent {
  private readonly pinService = inject(PinService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  protected readonly BodyLengthConstraints = BodyLengthConstraints;
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  id: string | null = null;
  post = signal<PinDto | null>(null);
  comments = signal<GetCommentsResDto | null>(null);
  busyState: BusyState = new BusyState();
  showMoreBusyState: BusyState = new BusyState();
  hasMoreResults = signal(false);
  private lastTimestamp: string = new Date().toISOString();

  commentForm = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(BodyLengthConstraints.MIN), Validators.maxLength(BodyLengthConstraints.MAX)]],
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

    this.loadComments(5);
  }

  loadComments(results: number) {
    if (!this.id) return;

    const req: GetCommentsReqDto = {
      pinId: Number(this.id),
      maxResults: results,
      lastTimestamp: this.lastTimestamp
    };

    this.showMoreBusyState.setBusy(true);
    this.pinService.getComments(req).subscribe({
      next: (res) => {
        this.comments.update(current => {
          if (!current) return res;

          this.hasMoreResults.set(res.hasMoreResults);

          return {
            ...res,
            comments: [...current.comments, ...res.comments]
          };
        });

        if (res.comments.length > 0) {
          const lastComment = res.comments[res.comments.length - 1];
          this.lastTimestamp = lastComment.createdAt;
        } else {
          this.hasMoreResults.set(false);
        }

        this.showMoreBusyState.setBusy(false);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  showMore() {
    this.loadComments(5);
  }

  submitComment() {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const body = this.commentForm.controls.body.value?.trim();
    if (!body) return;

    this.busyState.setBusy(true);
    const dto: CreateCommentReqDto = {
      pinId: Number(this.id),
      body: body
    };
    this.pinService.createComment(dto).subscribe({
      next: () => {
        this.commentForm.reset();
        this.busyState.setBusy(false);
        toast.success("Comment submitted successfully");
        this.comments.set(null);
        this.lastTimestamp = new Date().toISOString();
        this.loadComments(5);
      },
      error: (err) => {
        console.log(err);
        this.busyState.setBusy(false);
        toast.error('Error submitting comment');
      }
    });
  }
}
