import { Component, inject, signal } from '@angular/core';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ReportService } from '@gofish/shared/services/report.service';
import { GetReportReqDTO, GetReportResDTO } from '@gofish/shared/dtos/report.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { GfCardCommentPreviewComponent } from '@gofish/shared/components/gf-card-comment-preview/gf-card-comment-preview.component';

/**
 * Statistics reports dashboard component.
 *
 * Responsibilities:
 * - Load recent reported pins and comments for moderation overview
 * - Maintain independent pagination state for pin and comment reports
 * - Expose report counts grouped by target entity
 */
@Component({
  selector: 'app-stats-reports',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);

  /** Stores the loaded reported pin entries. */
  protected readonly reportedPins = signal<GetReportResDTO[]>([]);

  /** Stores the loaded reported comment entries. */
  protected readonly reportedComments = signal<GetReportResDTO[]>([]);

  /** Indicates whether more pin reports are available to load. */
  protected pinhasMoreResults = signal(false);

  /** Indicates whether more comment reports are available to load. */
  protected commenthasMoreResults = signal(false);

  /** Cursor used to paginate pin reports by creation date. */
  private pinlastCreatedAt: string | undefined = new Date().toISOString();

  /** Cursor used to paginate comment reports by creation date. */
  private commentlastCreatedAt: string | undefined = new Date().toISOString();

  /** Prevents concurrent pin report loading requests. */
  private isLoadingPins = false;

  /** Prevents concurrent comment report loading requests. */
  private isLoadingComments = false;

  /**
   * Loads the initial batches of reported pins and comments.
   */
  ngOnInit(): void {
    this.loadMorePins();
    this.loadMoreComments();
  }

  /**
   * Loads the next batch of reported pins.
   */
  protected loadMorePins(): void {
    if (this.isLoadingPins) return;

    this.isLoadingPins = true;

    const request: GetReportReqDTO = {
      maxResults: 5,
      lastCreatedAt: this.pinlastCreatedAt
    };

    this.reportService.getPinReports(request).subscribe({
      next: (res) => {
        this.pinhasMoreResults.set(res.hasMoreResults);
        this.pinlastCreatedAt = res.lastCreatedAt ?? undefined;
        this.reportedPins.update(current => [...current, ...res.reports]);
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
      }
    });
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
        console.log(this.reportedComments());
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
        this.isLoadingComments = false;
      }
    });
  }

  /**
   * Returns the number of reports associated with a specific pin.
   *
   * @param pinId Identifier of the pin
   * @returns Number of reports targeting the specified pin
   */
  getPinReportCount(pinId: number): number {
    return this.reportedPins().filter(r => r.targetId === pinId).length;
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
