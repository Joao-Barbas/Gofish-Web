import { Component, inject, signal } from '@angular/core';
import { Router, /*RouterLink */ } from "@angular/router";
import { GfCardQuickViewComponent } from "../../components/gf-card-quick-view/gf-card-quick-view.component";

import { UsersChartComponent } from "@gofish/shared/components/users-chart/users-chart.component";
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';
import { GfCardQuickAccessComponent } from '@gofish/features/statistics/components/gf-card-quick-access/gf-card-quick-access.component';
import { PinsAvgPublishedChart } from "@gofish/shared/components/pins-avg-published-chart/pins-avg-published-chart.component";
import { PinWeekStats, PinsPerWeekComponent } from '@gofish/shared/components/pins-per-week/pins-per-week.component';
import { GetActiveUsersResDTO, GetPinsCreatedTodayResDTO, GetPinsWith15PositiveVotesResDTO, GetRegisteredUsersWeeklyStatsResDTO, GetReportsWaitingReviewResDTO } from '@gofish/shared/dtos/stats.dto';
import { StatsService } from '@gofish/shared/services/stats.service';

/**
 * Aggregated monthly statistics for pin creation.
 */
export interface PinMonthStats {
  /** Display name of the month. */
  monthName: string;

  /** Year associated with the month. */
  year: number;

  /** Total number of catch pins created in the month. */
  catchCount: number;

  /** Total number of info pins created in the month. */
  infoCount: number;

  /** Total number of warning pins created in the month. */
  warningCount: number;
}

/**
 * Statistics dashboard home component.
 *
 * Responsibilities:
 * - Load high-level administrative statistics from the backend
 * - Load weekly pin creation statistics for the current and previous month
 * - Aggregate weekly pin data into monthly totals
 * - Expose dashboard metrics and chart data to the template
 */
@Component({
  selector: 'app-home',
  imports: [/*RouterLink, */ GfCardQuickViewComponent, GfCardQuickAccessComponent, UsersChartComponent, PinsAvgPublishedChart, PinsPerWeekComponent],
  templateUrl: './stats-home.component.html',
  styleUrl: './stats-home.component.css',
})
export class StatsHomeComponent {
  private readonly router = inject(Router);
  private readonly statsService = inject(StatsService);

  /** Number of reports currently waiting for review. */
  protected reportsWaitingReview = signal<GetReportsWaitingReviewResDTO | null>(null);

  /** Number of active users. */
  protected activeUsers = signal<GetActiveUsersResDTO | null>(null);

  /** Number of pins created today. */
  protected pinsCreatedToday = signal<GetPinsCreatedTodayResDTO | null>(null);

  /** Number of pins with at least 15 positive votes. */
  protected pinsWith15PositiveVotes = signal<GetPinsWith15PositiveVotesResDTO | null>(null);

  /** Weekly API success rate percentage. */
  protected weeklyApiSuccessRate = signal<number | null>(null);

  /** Weekly registered user statistics. */
  protected usersWeeklyStats = signal<GetRegisteredUsersWeeklyStatsResDTO[]>([]);

  /** Current calendar year. */
  protected currentYear = new Date().getFullYear();

  /** Weekly pin statistics for the current month. */
  protected pinWeeksCurrentMonth = signal<PinWeekStats[]>([]);

  /** Weekly pin statistics for the previous month. */
  protected pinWeeksLastMonth = signal<PinWeekStats[]>([]);

  /** Indicates whether the UI is currently focused on last month data. */
  isLastMonth: boolean = false;

  /**
   * Aggregates weekly pin statistics into monthly totals.
   *
   * @param weeks Weekly pin statistics for the target month
   * @param monthStats Monthly stats object to update
   */
  private calcTotals(weeks: PinWeekStats[], monthStats: PinMonthStats): void {
    let catchTotal: number = 0;
    let infoTotal: number = 0;
    let warningTotal: number = 0;

    for (const week of weeks) {
      catchTotal += week.catchCount;
      infoTotal += week.infoCount;
      warningTotal += week.warningCount;
    }

    monthStats.catchCount = catchTotal;
    monthStats.infoCount = infoTotal;
    monthStats.warningCount = warningTotal;

    if (weeks.length > 0) {
      monthStats.year = weeks[0].year;
    }
  }

  /** Aggregated statistics for the previous month. */
  public lastMonthStats: PinMonthStats = {
    monthName: '',
    year: 0,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

  /** Aggregated statistics for the current month. */
  public currentMonthStats: PinMonthStats = {
    monthName: '',
    year: 0,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

  /**
   * Loads dashboard statistics and weekly pin metrics for
   * the current and previous month.
   */
  ngOnInit() {
    this.statsService.getReportsWaitingReview().subscribe({
      next: (res) => {
        this.reportsWaitingReview.set(res);
      }
    });

    this.statsService.getActiveUsers().subscribe({
      next: (res) => {
        this.activeUsers.set(res);
      }
    });

    this.statsService.getPinsCreatedToday().subscribe({
      next: (res) => {
        this.pinsCreatedToday.set(res);
      }
    });

    this.statsService.getPinsWith15PositiveVotes().subscribe({
      next: (res) => {
        this.pinsWith15PositiveVotes.set(res);
      }
    });

    this.statsService.getWeeklyApiSuccessRate().subscribe({
      next: (res) => {
        this.weeklyApiSuccessRate.set(res.successRateOfRequests > 100 ? 100 : res.successRateOfRequests);
      }
    });

    const current = this.getCurrentMonthAndYear();
    const last = this.getLastMonthAndYear();

    this.currentMonthStats.monthName = this.getMonthName(current.month, current.year);
    this.currentMonthStats.year = current.year;

    this.lastMonthStats.monthName = this.getMonthName(last.month, last.year);
    this.lastMonthStats.year = last.year;

    this.statsService.getPinsWeeklyStats(last.month, last.year).subscribe({
      next: (res) => {
        this.pinWeeksLastMonth.set(res);
        const stats = { ...this.lastMonthStats };
        this.calcTotals(res, stats);
        this.lastMonthStats = stats;
        console.log('Last Month Stats:', this.lastMonthStats);
      }
    });

    this.statsService.getPinsWeeklyStats(current.month, current.year).subscribe({
      next: (res) => {
        this.pinWeeksCurrentMonth.set(res);
        const stats = { ...this.currentMonthStats };
        this.calcTotals(res, stats);
        this.currentMonthStats = stats;
        console.log('Current Month Stats:', this.currentMonthStats);
      }
    });
  }

  /**
   * Returns the current month and year.
   *
   * @returns Object containing current month and year
   */
  private getCurrentMonthAndYear(): { month: number; year: number } {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }

  /**
   * Returns the previous month and its associated year.
   *
   * @returns Object containing previous month and year
   */
  private getLastMonthAndYear(): { month: number; year: number } {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      month: lastMonthDate.getMonth() + 1,
      year: lastMonthDate.getFullYear()
    };
  }

  /**
   * Returns the localized month name for the provided month and year.
   *
   * @param month Month number in the range 1-12
   * @param year Year associated with the month
   * @returns Localized month name
   */
  private getMonthName(month: number, year: number): string {
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  }
}
