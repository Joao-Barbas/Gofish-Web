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

type PinReportMap = { [pinId: number]: GetReportResDTO[] };

@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent, /*RouterLink*/],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);
  protected reportedPins = signal<PinDto[]>([]);
  protected hasMoreResults = signal(false);
  protected reportMap = signal<PinReportMap>({});
  private lastCreatedAt: string | undefined = new Date().toISOString();
  private isLoading = false;

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore(): void {
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

        this.mergeReportsByPin(res.reports);
        this.loadMissingPins(res.reports);
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private mergeReportsByPin(reports: GetReportResDTO[]): void {
    const updatedMap: PinReportMap = { ...this.reportMap() };

    for (const report of reports) {
      const pinId = report.targetId;

      if (!updatedMap[pinId]) {
        updatedMap[pinId] = [];
      }

      const alreadyExists = updatedMap[pinId].some(existing => existing.id === report.id);

      if (!alreadyExists) {
        updatedMap[pinId].push(report);
      }
    }

    this.reportMap.set(updatedMap);
  }

  private loadMissingPins(reports: GetReportResDTO[]): void {
    const existingPinIds = new Set(this.reportedPins().map(pin => pin.id));

    const missingPinIds = [...new Set(
      reports
        .map(report => report.targetId)
        .filter(pinId => !existingPinIds.has(pinId))
    )];

    if (missingPinIds.length === 0) return;

    const request: GetPinsReqDto = {
      ids: missingPinIds.map(pinId => ({ pinId })),
      dataRequest: {
        includeAuthor: true,
        includeDetails: true,
        includeUgc: true,
        includeStats: true
      }
    };

    this.pinService.getPins(request).subscribe({
      next: (res) => {
        this.reportedPins.update(current => [...current, ...res.pins]);
      },
      error: (err) => {
        console.error('Failed to load pin details:', err);
      }
    });
  }

  getReportCount(pinId: number): number {
  return this.reportMap()[pinId]?.length ?? 0;
}
}


