import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GfCardPinPreviewComponent } from '@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component';
import { GetReportResDTO, GetReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { ReportService } from '@gofish/shared/services/report.service';

/**
 * Displays the list of reported pins for moderation review.
 *
 * Responsibilities:
 * - Load paginated pin reports from the backend
 * - Expose reported pins to the template
 * - Track pagination and loading state
 * - Provide the number of reports associated with each pin
 */
@Component({
  selector: 'gf-reported-pins',
  imports: [GfCardPinPreviewComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reported-pins.component.html',
  styleUrl: './reported-pins.component.css',
})
export class ReportedPinsComponent {
  private readonly reportService = inject(ReportService);
  private readonly pinService = inject(PinService);

  /** Stores the loaded reported pins. */
  protected readonly reportedPins = signal<GetReportResDTO[]>([]);

  /** Indicates whether more pin reports are available to load. */
  protected readonly pinhasMoreResults = signal(false);

  /** Cursor used to paginate pin reports by creation date. */
  private pinlastCreatedAt: string | undefined = new Date().toISOString();

  /** Prevents concurrent report loading requests. */
  private isLoadingPins = false;

  /**
   * Loads the initial batch of reported pins.
   */
  ngOnInit(): void {
    this.loadMorePins();
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
        this.isLoadingPins = false;
      },
      error: (err) => {
        console.error('Failed to load reports:', err);
        this.isLoadingPins = false;
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
}
