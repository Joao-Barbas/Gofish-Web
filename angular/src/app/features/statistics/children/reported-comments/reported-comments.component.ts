import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GfCardCommentPreviewComponent } from '@gofish/shared/components/gf-card-comment-preview/gf-card-comment-preview.component';
import { GetReportResDTO, GetReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { ReportService } from '@gofish/shared/services/report.service';

@Component({
  selector: 'gf-reported-comments',
  imports: [GfCardCommentPreviewComponent,RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reported-comments.component.html',
  styleUrl: './reported-comments.component.css',
})
export class ReportedCommentsComponent {
  private readonly reportService = inject(ReportService);
  protected readonly reportedComments = signal<GetReportResDTO[]>([]);
  protected commenthasMoreResults = signal(false);
  private commentlastCreatedAt: string | undefined = new Date().toISOString();
  private isLoadingComments = false;

  ngOnInit(): void {
    this.loadMoreComments();
  }

  protected loadMoreComments(): void {
    if (this.isLoadingComments) return;

    this.isLoadingComments = true;

    const request: GetReportReqDTO = {
      maxResults: 5,
      lastCreatedAt: this.commentlastCreatedAt
    };

    this.reportService.getCommentReports(request).subscribe({
      next: (res) => {
        this.commenthasMoreResults.set(res.hasMoreResults);
        this.commentlastCreatedAt = res.lastCreatedAt ?? undefined;
        this.reportedComments.update(current => [...current, ...res.reports]);
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
        this.isLoadingComments = false;
      }
    });
  }

  getCommentReportCount(commentId: number): number {
    return this.reportedComments().filter(r => r.targetId === commentId).length;
  }
}
