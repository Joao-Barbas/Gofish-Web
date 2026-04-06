import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { PinService } from '@gofish/shared/services/pin.service';

@Component({
  selector: 'gf-gf-card-comment-preview',
  imports: [],
  templateUrl: './gf-card-comment-preview.component.html',
  styleUrl: './gf-card-comment-preview.component.css',
})
export class GfCardCommentPreviewComponent {
  private readonly pinService = inject(PinService);
  readonly avatarService = inject(AvatarService);

  commentId = input.required<number>();
  commentData = signal<PinDto | null>(null);
  isReportedPin = input<boolean>(false);
  reportNumber = input<number>();
  reportIndex = input<number>();

  pinKind = PinKind;

  commentLink = computed(() => `pin/${this.commentId()}`);


  ngOnInit() {
    /* this.pinService.getComments({ ids: [{ commentId: this.commentId() }] }).subscribe({
      next: (res) => {
        this.commentData.set(res.comments[0]);
      },
      error: (err: HttpErrorResponse) => console.error(err)
    }); */
  }

  getEnumDisplayName(options: EnumDTO[], value: number): string {
    if (value === null) return '';
    const option = options.find(opt => opt.value === value);
    return option ? option.display : '';
  }
}
