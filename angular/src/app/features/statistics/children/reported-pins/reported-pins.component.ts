import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GfCardPinPreviewComponent } from '@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component';
import { GetReportResDTO, GetReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { ReportService } from '@gofish/shared/services/report.service';

@Component({
  selector: 'gf-reported-pins',
  imports: [GfCardPinPreviewComponent,RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reported-pins.component.html',
  styleUrl: './reported-pins.component.css',
})
export class ReportedPinsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);
  protected readonly reportedPins = signal<GetReportResDTO[]>([]);
  protected readonly pinhasMoreResults = signal(false);

  private pinlastCreatedAt: string | undefined = new Date().toISOString();
  private isLoadingPins = false;

  ngOnInit(): void {
    this.loadMorePins();
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
        this.isLoadingPins = false;
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
        this.isLoadingPins = false;
      }
    });
  }

  getPinReportCount(pinId: number): number {
    return this.reportedPins().filter(r => r.targetId === pinId).length;
  }
}
