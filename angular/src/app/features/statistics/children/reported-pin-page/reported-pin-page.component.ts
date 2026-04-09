import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserHelpBoxComponent } from "@gofish/shared/components/user-help-box/user-help-box.component";
import { PinDto, GetPinsReqDto } from '@gofish/shared/dtos/pin.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { ReportService } from '@gofish/shared/services/report.service';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";
import { GetReportResDTO } from '@gofish/shared/dtos/report.dto';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-reported-pin-page',
  imports: [UserHelpBoxComponent, ForumPostComponent, LoadingSpinnerComponent, TimeAgoPipe],
  templateUrl: './reported-pin-page.component.html',
  styleUrl: './reported-pin-page.component.css',
})
export class ReportedPinPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pinService = inject(PinService);
  private readonly reportService = inject(ReportService);
  protected pinData = signal<PinDto | null>(null);
  protected reports = signal<GetReportResDTO[]>([]);
  protected hasMoreResults = signal<boolean>(false);
  private lastCreatedAt: string | undefined = undefined;
  protected selectedReportIds = signal<Set<number>>(new Set());
  protected readonly pinId = signal<number | null>(null);

  header: string = "Review Pin Reports";
  body: string = "To review Pin Reports, make sure to read the individual reports made by other users and see if there's a pattern of report types that you can then use to understand why the Pin is not suitable for the platform when reading its contents.\n\nMake sure to check every part of the Pin post below to see if it falls under any report type and if so, mark any report type that users have identified on the left.\n\nYou don't need to mark the same report type more than once.";

  alertText: string = "You have yet to mark the Pin post with one of the report type on the right";

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.pinId.set(id);
    this.fetchPinData(id);
    this.loadReports(id);
  }

  private fetchPinData(pinId: number) {
    const request: GetPinsReqDto = {
      ids: [{ pinId }],
      dataRequest: {
        includeAuthor: true,
        includeDetails: true,
        includeUgc: true,
        includeStats: true
      }
    };

    this.pinService.getPins(request).subscribe({
      next: (res) => {
        if (res.pins.length > 0) {
          this.pinData.set(res.pins[0]);
        }
      },
      error: (err) => console.error(err)
    });
  }

  private loadReports(pinId: number) {
    const request = {
      pinId,
      maxResults: 5,
      lastCreatedAt: this.lastCreatedAt
    };
    this.reportService.getPinReportsByPin(request).subscribe({
      next: (res) => {
        this.reports.update(current => [...current, ...res.reports]);

        this.hasMoreResults.set(res.hasMoreResults);
        this.lastCreatedAt = res.lastCreatedAt;
      },
      error: (err) => console.error(err)
    });
  }

  loadMoreReports() {
    const pinId = this.pinData()?.id;
    if (pinId) {
      this.loadReports(pinId);
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
      this.alertText = "You have yet to mark the Pin post with one of the report type on the right";
    }
  }

  isReportSelected(reportId: number): boolean {
    return this.selectedReportIds().has(reportId);
  }

  hasSelectedReports(): boolean {
    return this.selectedReportIds().size > 0;
  }

  acceptSelectedReports() {
    if (!this.pinId()) return;
    this.pinService.deletePin(this.pinId()!).subscribe({
      next: () => {
        toast.success('Selected reports accepted and pin deleted successfully');
      }
    });
    window.history.back();
  }

  rejectSelectedReports() {
    this.reportService.deletePinReports({ ids: Array.from(this.selectedReportIds()) }).subscribe({
      next: () => {
        toast.success('Selected reports rejected and pin kept successfully');
        this.reports.update(current => current.filter(r => r.id !== Array.from(this.selectedReportIds())[0]));
        this.selectedReportIds.set(new Set());
        this.updateAlertText();
      }
    });
  }
}
