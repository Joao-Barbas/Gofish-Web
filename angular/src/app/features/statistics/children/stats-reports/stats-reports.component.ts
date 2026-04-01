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
  private lastTimestamp: string = new Date().toISOString();
  protected reportMap = signal<PinReportMap>({});

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    const request: GetReportReqDTO = {
      maxResults: 5,
      lastCreatedAt: this.lastTimestamp
    };

    this.reportService.getPinReports(request).subscribe({
      next: (res) => {
        this.hasMoreResults.set(res.hasMoreResults);
        this.lastTimestamp = res.lastCreatedAt!;

        const currentMap: PinReportMap = { ...this.reportMap() };

        res.reports.forEach(report => {
          const pinId = report.targetId;
          if (!currentMap[pinId]) {
            currentMap[pinId] = [];
          }

          if (!currentMap[pinId].some(r => r.id === report.id)) {
            currentMap[pinId].push(report);
          }
        });

        this.reportMap.set(currentMap);

        const pinIdsToFetch = res.reports.map(r => ({ pinId: r.targetId }));
        this.fetchPinDetails(pinIdsToFetch);
      }
    });
  }

  private fetchPinDetails(ids: { pinId: number }[]) {
    const pinRequest: GetPinsReqDto = {
      ids: ids,
      dataRequest: {
        includeAuthor: true,
        includeDetails: true,
        includeUgc: true,
        includeStats: true
      }
    };

    this.pinService.getPins(pinRequest).subscribe({
      next: (res) => {
        this.reportedPins.update(current => [...current, ...res.pins]);
      },
      error: (err) => console.error(err)
    });
  }

}

