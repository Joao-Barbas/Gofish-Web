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
  protected commentData = signal<CommentDto | null>(null);
  protected reports = signal<GetReportResDTO[]>([]);
  protected hasMoreResults = signal<boolean>(false);
  private lastCreatedAt: string | undefined = undefined;
  protected selectedReportIds = signal<Set<number>>(new Set());
  protected readonly commentId = signal<number | null>(null);

  header: string = "Review Comment Reports";
  body: string = "To review Comment Reports, make sure to read the individual reports made by other users and see if there's a pattern of report types that you can then use to understand why the Comment is not suitable for the platform when reading its contents.\n\nMake sure to check every part of the Comment post below to see if it falls under any report type and if so, mark any report type that users have identified on the left.\n\nYou don't need to mark the same report type more than once.";

  alertText: string = "You have yet to mark the Comment post with one of the report type on the right";

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.commentId.set(id);
    this.fetchCommentData(id);
    this.loadReports(id);
  }

  private fetchCommentData(commentId: number) {

    this.pinService.getComment(commentId).subscribe({
      next: (res) => {
          this.commentData.set(res);

      },
      error: (err) => console.error(err)
    });
  }

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

  loadMoreReports() {
    const commentId = this.commentData()?.id;
    if (commentId) {
      this.loadReports(commentId);
    }
  }

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

  private updateAlertText() {
    if (this.selectedReportIds().size > 0) {
      this.alertText = `You have selected ${this.selectedReportIds().size} report(s) to action.`;
    } else {
      this.alertText = "You have yet to mark the Comment post with one of the report type on the right";
    }
  }

  isReportSelected(reportId: number): boolean {
    return this.selectedReportIds().has(reportId);
  }

  hasSelectedReports(): boolean {
    return this.selectedReportIds().size > 0;
  }

  acceptSelectedReports() {
    if (!this.commentId()) return;
    this.pinService.deletePin(this.commentId()!).subscribe({
      next: () => {
        toast.success('Selected reports accepted and comment deleted successfully');
      }
    });
    window.history.back();
  }

  rejectSelectedReports() {
    this.reportService.deleteCommentReports({ ids: Array.from(this.selectedReportIds()) }).subscribe({
      next: () => {
        toast.success('Selected reports rejected and comment kept successfully');
        this.reports.update(current => current.filter(r => r.id !== Array.from(this.selectedReportIds())[0]));
        this.selectedReportIds.set(new Set());
        this.updateAlertText();
      }
    });
  }

}
