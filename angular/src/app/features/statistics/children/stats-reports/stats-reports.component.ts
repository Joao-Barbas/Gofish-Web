import { Component, inject, signal } from '@angular/core';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { NavigationEnd, Router, /*RouterLink, */ RouterLinkActive, RouterOutlet } from "@angular/router";


import { Species } from '../../../../shared/enums/species.enum';
import { Bait } from '../../../../shared/enums/bait.enums';
import { AccessDifficulty } from '../../../../shared/enums/access-difficulty.enums';
import { Seabed } from '../../../../shared/enums/seabed.enum';
import { WarningKind } from '../../../../shared/enums/warning-kind.enum';
import { GetPinsReqDto, PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { StatsService } from '@gofish/shared/services/stats.service';
import { GetReportsWaitingReviewResDTO } from '@gofish/shared/dtos/stats.dto';
import { ReportService } from '@gofish/shared/services/report.service';
import { GetReportReqDTO, GetReportResDTO } from '@gofish/shared/dtos/report.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { GfCardCommentPreviewComponent } from '@gofish/shared/components/gf-card-comment-preview/gf-card-comment-preview.component';


@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent, GfCardCommentPreviewComponent],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);
  protected readonly reportedPins = signal<GetReportResDTO[]>([]);
  protected readonly reportedComments = signal<GetReportResDTO[]>([]);
  protected pinhasMoreResults = signal(false);
  protected commenthasMoreResults = signal(false);
  private pinlastCreatedAt: string | undefined = new Date().toISOString();
  private commentlastCreatedAt: string | undefined = new Date().toISOString();
  private isLoadingPins = false;
  private isLoadingComments = false;

  ngOnInit(): void {
    this.loadMorePins();
    this.loadMoreComments();
  }

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
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
      }
    });
  }

  getPinReportCount(pinId: number): number {
    return this.reportedPins().filter(r => r.targetId === pinId).length;
  }

  getCommentReportCount(commentId: number): number {
    return this.reportedComments().filter(r => r.targetId === commentId).length;
  }

}


