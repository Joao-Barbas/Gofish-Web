import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { LoadingSpinnerComponent } from '@gofish/shared/components/loading-spinner/loading-spinner.component';
import { UserHelpBoxComponent } from '@gofish/shared/components/user-help-box/user-help-box.component';
import { PinDto, GetPinsReqDto, CommentDto } from '@gofish/shared/dtos/pin.dto';
import { GetReportResDTO } from '@gofish/shared/dtos/report.dto';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinService } from '@gofish/shared/services/pin.service';
import { ReportService } from '@gofish/shared/services/report.service';
import { toast } from 'ngx-sonner';

/**
 * Displays a moderation page for a reported comment and its associated reports.
 *
 * Responsibilities:
 * - Load the reported comment data
 * - Load and paginate reports associated with the comment
 * - Allow moderators to select reports for action
 * - Accept or reject the selected reports
 */
@Component({
  selector: 'gf-reported-comment-page',
  imports: [UserHelpBoxComponent, ForumPostComponent, LoadingSpinnerComponent, TimeAgoPipe],
  templateUrl: './reported-comment-page.component.html',
  styleUrl: './reported-comment-page.component.css',
})
export class ReportedCommentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pinService = inject(PinService);
  private readonly reportService = inject(ReportService);

  /** Stores the reported comment data. */
  protected commentData = signal<CommentDto | null>(null);

  /** Stores the loaded reports associated with the comment. */
  protected reports = signal<GetReportResDTO[]>([]);

  /** Indicates whether more reports are available to load. */
  protected hasMoreResults = signal<boolean>(false);

  /** Cursor used to paginate reports by creation date. */
  private lastCreatedAt: string | undefined = undefined;

  /** Stores the identifiers of the currently selected reports. */
  protected selectedReportIds = signal<Set<number>>(new Set());

  /** Identifier of the comment currently under review. */
  protected readonly commentId = signal<number | null>(null);

  /** Page header displayed to the moderator. */
  header: string = "Review Comment Reports";

  /** Help text explaining the moderation workflow. */
  body: string = "To review Comment Reports, make sure to read the individual reports made by other users and see if there's a pattern of report types that you can then use to understand why the Comment is not suitable for the platform when reading its contents.\n\nMake sure to check every part of the Comment post below to see if it falls under any report type and if so, mark any report type that users have identified on the left.\n\nYou don't need to mark the same report type more than once.";

  /** Alert text displayed according to the moderator selection state. */
  alertText: string = "You have yet to mark the Comment post with one of the report type on the right";

  /**
   * Loads the comment identifier from the route and initializes
   * the comment and report data for review.
   */
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.commentId.set(id);
    this.fetchCommentData(id);
    this.loadReports(id);
  }

  /**
   * Loads the comment data for the specified comment identifier.
   *
   * @param commentId Identifier of the reported comment
   */
  private fetchCommentData(commentId: number) {
    this.pinService.getComment(commentId).subscribe({
      next: (res) => {
        this.commentData.set(res);
      },
      error: (err) => console.error(err)
    });
  }

  /**
   * Loads a batch of reports associated with the specified comment.
   *
   * @param commentId Identifier of the reported comment
   */
  private loadReports(commentId: number) {
    const request = {
      commentId,
      maxResults: 5,
      lastCreatedAt: this.lastCreatedAt
    };

    this.reportService.getCommentReportsByComment(request).subscribe({
      next: (res) => {
        this.reports.update(current => [...current, ...res.reports]);

        this.hasMoreResults.set(res.hasMoreResults);
        this.lastCreatedAt = res.lastCreatedAt;
      },
      error: (err) => console.error(err)
    });
  }

  /**
   * Loads the next batch of reports for the current comment.
   */
  loadMoreReports() {
    const commentId = this.commentData()?.id;
    if (commentId) {
      this.loadReports(commentId);
    }
  }

  /**
   * Toggles the selection state of a report and refreshes the alert text.
   *
   * @param reportId Identifier of the report to select or unselect
   */
  toggleReportSelection(reportId: number) {
    this.selectedReportIds.update(set => {
      const newSet = new Set(set);

      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }

      return newSet;
    });

    this.updateAlertText();
  }

  /**
   * Updates the alert text according to the number of selected reports.
   */
  private updateAlertText() {
    if (this.selectedReportIds().size > 0) {
      this.alertText = `You have selected ${this.selectedReportIds().size} report(s) to action.`;
    } else {
      this.alertText = "You have yet to mark the Comment post with one of the report type on the right";
    }
  }

  /**
   * Indicates whether a specific report is currently selected.
   *
   * @param reportId Identifier of the report to check
   * @returns True when the report is selected
   */
  isReportSelected(reportId: number): boolean {
    return this.selectedReportIds().has(reportId);
  }

  /**
   * Indicates whether at least one report is currently selected.
   *
   * @returns True when one or more reports are selected
   */
  hasSelectedReports(): boolean {
    return this.selectedReportIds().size > 0;
  }

  /**
   * Accepts the selected reports by deleting the reported comment.
   */
  acceptSelectedReports() {
    if (!this.commentId()) return;

    this.pinService.deletePin(this.commentId()!).subscribe({
      next: () => {
        toast.success('Selected reports accepted and comment deleted successfully');
      }
    });

    window.history.back();
  }

  /**
   * Rejects the selected reports and keeps the comment.
   */
  rejectSelectedReports() {
    const selectedIds = new Set(this.selectedReportIds());
    this.reportService.deleteCommentReports({ ids: Array.from(this.selectedReportIds()) }).subscribe({
      next: () => {
        toast.success('Selected reports rejected and comment kept successfully');
        /* this.reports.update(current => current.filter(r => r.id !== Array.from(this.selectedReportIds())[0])); */
        this.reports.update(current => current.filter(r => !selectedIds.has(r.id)));
        this.selectedReportIds.set(new Set());
        this.updateAlertText();
      }
    });
  }
}
