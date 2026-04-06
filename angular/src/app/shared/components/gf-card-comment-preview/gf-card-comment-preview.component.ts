import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CommentDto, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { PinService } from '@gofish/shared/services/pin.service';
import { TimeAgoPipe } from "../../pipes/time-ago.pipe";
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserTitleComponent } from '@gofish/shared/components/user-title/user-title.component';

@Component({
  selector: 'gf-gf-card-comment-preview',
  imports: [NgClass, TimeAgoPipe, RouterLink, UserTitleComponent],
  templateUrl: './gf-card-comment-preview.component.html',
  styleUrl: './gf-card-comment-preview.component.css',
})
export class GfCardCommentPreviewComponent {
  private readonly pinService = inject(PinService);
  readonly avatarService = inject(AvatarService);

  commentId = input<number>();
  commentData = signal<CommentDto | null>(null);
  isReportedComment = input<boolean>(false);
  reportNumber = input<number>();
  reportIndex = input<number>();


  commentLink = computed(() => `comment/${this.commentId()}`);
  currentComment = computed(() => this.commentData() );

  ngOnInit() {
    this.pinService.getComment(this.commentId()!).subscribe({
      next: (res) => {
        this.commentData.set(res);
      },
      error: (err: HttpErrorResponse) => console.error(err)
    });
  }

  getEnumDisplayName(options: EnumDTO[], value: number): string {
    if (value === null) return '';
    const option = options.find(opt => opt.value === value);
    return option ? option.display : '';
  }
}
