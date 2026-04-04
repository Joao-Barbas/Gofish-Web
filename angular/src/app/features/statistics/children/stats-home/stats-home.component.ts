import { Component, inject } from '@angular/core';
import { Router, /*RouterLink */ } from "@angular/router";
import { GfCardQuickViewComponent } from "../../components/gf-card-quick-view/gf-card-quick-view.component";

import { UsersChartComponent } from "@gofish/shared/components/users-chart/users-chart.component";
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';
import { GfCardQuickAccessComponent } from '@gofish/features/statistics/components/gf-card-quick-access/gf-card-quick-access.component';
import { PinsAvgPublishedChart } from "@gofish/shared/components/pins-avg-published-chart/pins-avg-published-chart.component";
import { PinWeekStats, PinsPerWeekComponent } from '@gofish/shared/components/pins-per-week/pins-per-week.component';

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

  public marchStats: PinMonthStats = {
    monthName: 'March',
    year: 2025,
    catchCount: 45,
    infoCount: 20,
    warningCount: 5
  };

  public aprilStats: PinMonthStats = {
    monthName: 'April',
    year: 2025,
    catchCount: 55,
    infoCount: 15,
    warningCount: 12
  };

  mockPinWeeks: PinWeekStats[] = [
    { weekLabel: 'Day 3 to day 9', catchCount: 8, infoCount: 3, warningCount: 1 },
    { weekLabel: 'Day 10 to day 16', catchCount: 4, infoCount: 2, warningCount: 0 },
    { weekLabel: 'Day 17 to day 23', catchCount: 12, infoCount: 5, warningCount: 3 },
    { weekLabel: 'Day 24 to day 30', catchCount: 6, infoCount: 1, warningCount: 2 },
  ];

  // users-chart
  mockUsers = MOCK_USERS;

}

export const MOCK_USERS: Partial<GetUserProfileResDTO>[] = [
  // Semana 1 Mar (3/3 a 9/3) — 5 utilizadores (12.5%)
  { joinedAt: '2025-03-03T09:00:00' },
  { joinedAt: '2025-03-04T11:00:00' },
  { joinedAt: '2025-03-05T14:00:00' },
  { joinedAt: '2025-03-06T16:00:00' },
  { joinedAt: '2025-03-07T10:00:00' },

  // Semana 2 Mar (10/3 a 16/3) — 3 utilizadores (7.5%)
  { joinedAt: '2025-03-10T09:30:00' },
  { joinedAt: '2025-03-12T13:00:00' },
  { joinedAt: '2025-03-14T17:00:00' },

  // Semana 3 Mar (17/3 a 23/3) — 8 utilizadores (20%)
  { joinedAt: '2025-03-17T08:00:00' },
  { joinedAt: '2025-03-17T12:00:00' },
  { joinedAt: '2025-03-18T10:00:00' },
  { joinedAt: '2025-03-19T14:00:00' },
  { joinedAt: '2025-03-20T09:00:00' },
  { joinedAt: '2025-03-21T11:00:00' },
  { joinedAt: '2025-03-22T15:00:00' },
  { joinedAt: '2025-03-23T16:00:00' },

  // Semana 4 Mar (24/3 a 30/3) — 4 utilizadores (10%)
  { joinedAt: '2025-03-24T09:00:00' },
  { joinedAt: '2025-03-26T13:00:00' },
  { joinedAt: '2025-03-28T15:00:00' },
  { joinedAt: '2025-03-29T17:00:00' },

  // Semana 1 Abr (31/3 a 6/4) — 6 utilizadores (15%)
  { joinedAt: '2025-03-31T10:00:00' },
  { joinedAt: '2025-04-01T11:00:00' },
  { joinedAt: '2025-04-02T14:00:00' },
  { joinedAt: '2025-04-03T09:00:00' },
  { joinedAt: '2025-04-04T16:00:00' },
  { joinedAt: '2025-04-05T13:00:00' },

  // Semana 2 Abr (7/4 a 13/4) — 3 utilizadores (7.5%)
  { joinedAt: '2025-04-07T09:00:00' },
  { joinedAt: '2025-04-09T14:00:00' },
  { joinedAt: '2025-04-11T17:00:00' },

  // Semana 3 Abr (14/4 a 20/4) — 9 utilizadores (22.5%)
  { joinedAt: '2025-04-14T08:00:00' },
  { joinedAt: '2025-04-14T12:00:00' },
  { joinedAt: '2025-04-15T10:00:00' },
  { joinedAt: '2025-04-16T14:00:00' },
  { joinedAt: '2025-04-17T09:00:00' },
  { joinedAt: '2025-04-17T15:00:00' },
  { joinedAt: '2025-04-18T11:00:00' },
  { joinedAt: '2025-04-19T13:00:00' },
  { joinedAt: '2025-04-20T16:00:00' },

  // Semana 4 Abr (21/4 a 27/4) — 2 utilizadores (5%)
  { joinedAt: '2025-04-22T10:00:00' },
  { joinedAt: '2025-04-25T14:00:00' },
];
