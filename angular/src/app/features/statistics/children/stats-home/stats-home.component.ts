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

export interface PinMonthStats {
  monthName: string;
  year: number;
  catchCount: number;
  infoCount: number;
  warningCount: number;
}




@Component({
  selector: 'app-home',
  imports: [/*RouterLink, */ GfCardQuickViewComponent, GfCardQuickAccessComponent, UsersChartComponent, PinsAvgPublishedChart, PinsPerWeekComponent],
  templateUrl: './stats-home.component.html',
  styleUrl: './stats-home.component.css',
})
export class StatsHomeComponent {
  private readonly router = inject(Router);
  private readonly statsService = inject(StatsService);
  protected reportsWaitingReview = signal<GetReportsWaitingReviewResDTO | null>(null);
  protected activeUsers = signal<GetActiveUsersResDTO | null>(null);
  protected pinsCreatedToday = signal<GetPinsCreatedTodayResDTO | null>(null);
  protected pinsWith15PositiveVotes = signal<GetPinsWith15PositiveVotesResDTO | null>(null);
  protected weeklyApiSuccessRate = signal<number | null>(null);
  protected usersWeeklyStats = signal<GetRegisteredUsersWeeklyStatsResDTO[]>([]);
  protected currentYear = new Date().getFullYear();

  isLastMonth: boolean = false;

  mockPinWeeksLastMonth: PinWeekStats[] = [
    { year: 2026, weekLabel: 'Day 3 to day 9', catchCount: 6, infoCount: 3, warningCount: 1 },
    { year: 2026, weekLabel: 'Day 10 to day 16', catchCount: 7, infoCount: 3, warningCount: 14 },
    { year: 2026, weekLabel: 'Day 17 to day 23', catchCount: 12, infoCount: 9, warningCount: 19 },
    { year: 2026, weekLabel: 'Day 24 to day 30', catchCount: 9, infoCount: 6, warningCount: 17 },
  ];

  mockPinWeeksCurrentMonth: PinWeekStats[] = [
    { year: 2026, weekLabel: 'Day 3 to day 9', catchCount: 8, infoCount: 3, warningCount: 4 },
    { year: 2026, weekLabel: 'Day 10 to day 16', catchCount: 31, infoCount: 26, warningCount: 19 },
    { year: 2026, weekLabel: 'Day 17 to day 23', catchCount: 27, infoCount: 19, warningCount: 13 },
    { year: 2026, weekLabel: 'Day 24 to day 30', catchCount: 6, infoCount: 3, warningCount: 1 },
  ];


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
    monthStats.year = weeks[0].year;
  }

  public lastMonthStats: PinMonthStats = {
    monthName: 'March',
    year: 2025,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

  public currentMonthStats: PinMonthStats = {
    monthName: 'April',
    year: 2025,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

  ngOnInit() {
    this.calcTotals(this.mockPinWeeksLastMonth, this.lastMonthStats);
    this.calcTotals(this.mockPinWeeksCurrentMonth, this.currentMonthStats);
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
        this.weeklyApiSuccessRate.set(res.successRateOfRequests);
      }
    });
  }

}

