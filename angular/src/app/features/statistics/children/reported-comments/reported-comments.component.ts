import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GfCardCommentPreviewComponent } from '@gofish/shared/components/gf-card-comment-preview/gf-card-comment-preview.component';
import { GetReportResDTO, GetReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { ReportService } from '@gofish/shared/services/report.service';

/**
 * Displays the list of reported comments for moderation review.
 *
 * Responsibilities:
 * - Load paginated comment reports from the backend
 * - Expose reported comments to the template
 * - Track pagination and loading state
 * - Provide the number of reports associated with each comment
 */
@Component({
  selector: 'gf-reported-comments',
  imports: [GfCardCommentPreviewComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reported-comments.component.html',
  styleUrl: './reported-comments.component.css',
})
export class ReportedCommentsComponent {
  private readonly reportService = inject(ReportService);

  /** Stores the loaded reported comments. */
  protected readonly reportedComments = signal<GetReportResDTO[]>([]);

  /** Indicates whether more comment reports are available to load. */
  protected commenthasMoreResults = signal(false);

  /** Cursor used to paginate comment reports by creation date. */
  private commentlastCreatedAt: string | undefined = new Date().toISOString();

  /** Prevents concurrent report loading requests. */
  private isLoadingComments = false;

  /**
   * Loads the initial batch of reported comments.
   */
  ngOnInit(): void {
    this.loadMoreComments();
  }

  /**
   * Loads the next batch of reported comments.
   */
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

  /**
   * Returns the number of reports associated with a specific comment.
   *
   * @param commentId Identifier of the comment
   * @returns Number of reports targeting the specified comment
   */
  getCommentReportCount(commentId: number): number {
    return this.reportedComments().filter(r => r.targetId === commentId).length;
  }
}
