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
  protected pinWeeksCurrentMonth = signal<PinWeekStats[]>([]);
  protected pinWeeksLastMonth = signal<PinWeekStats[]>([]);

  isLastMonth: boolean = false;



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

  public lastMonthStats: PinMonthStats = {
    monthName: '',
    year: 0,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

  public currentMonthStats: PinMonthStats = {
    monthName: '',
    year: 0,
    catchCount: 0,
    infoCount: 0,
    warningCount: 0
  };

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
        this.weeklyApiSuccessRate.set(res.successRateOfRequests);
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
  private getCurrentMonthAndYear(): { month: number; year: number } {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }

  private getLastMonthAndYear(): { month: number; year: number } {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      month: lastMonthDate.getMonth() + 1, // January is 0
      year: lastMonthDate.getFullYear()
    };
  }

  private getMonthName(month: number, year: number): string {
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  }

}

