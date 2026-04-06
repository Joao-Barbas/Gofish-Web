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


@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent, /*RouterLink*/],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);
  protected readonly reportedPins = signal<GetReportResDTO[]>([]);
  protected readonly reportedComments = signal<GetReportResDTO[]>([]);
  protected hasMoreResults = signal(false);
  private lastCreatedAt: string | undefined = new Date().toISOString();
  private isLoading = false;

  ngOnInit(): void {
    this.loadMorePins();
    this.loadMoreComments();
  }

  protected loadMorePins(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const request: GetReportReqDTO = {
      maxResults: 5,
      lastCreatedAt: this.lastCreatedAt
    };

    this.reportService.getPinReports(request).subscribe({
      next: (res) => {
        this.hasMoreResults.set(res.hasMoreResults);
        this.lastCreatedAt = res.lastCreatedAt ?? undefined;
        this.reportedPins.update(current => [...current, ...res.reports]);
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
      }
    });
  }

  protected loadMoreComments(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const request: GetReportReqDTO = {
      maxResults: 5,
      lastCreatedAt: this.lastCreatedAt
    };

    this.reportService.getCommentReports(request).subscribe({
      next: (res) => {
        this.hasMoreResults.set(res.hasMoreResults);
        this.lastCreatedAt = res.lastCreatedAt ?? undefined;
        this.reportedComments.update(current => [...current, ...res.reports]);
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
      }
    });
  }

}


