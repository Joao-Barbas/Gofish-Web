import { Component, input, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';
import { GetRegisteredUsersWeeklyStatsResDTO } from '@gofish/shared/dtos/stats.dto';

Chart.register(...registerables);

@Component({
  selector: 'gf-users-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './users-chart.component.html',
  styleUrl: './users-chart.component.css',
})
export class UsersChartComponent implements OnChanges {

  users = input<GetRegisteredUsersWeeklyStatsResDTO[]>([]);

  private getCssVar(variable: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  }

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {};
  chartTitle: string = `Registered Users Per Week ${new Date().getFullYear()}`;

  ngOnChanges(): void {
    this.buildChart();
  }

  private buildChart(): void {
    const usersData = this.users();

    if (!usersData || usersData.length === 0) return;

    const lineColor = this.getCssVar('--gf-dark-text');
    const textColor = this.getCssVar('--gf-dark-text-muted');
    const gridColor = this.getCssVar('--gf-dark-text-muted-opacity-50');
    const fillColor = this.getCssVar('--gf-dark-text-muted-opacity-50');

    this.chartData = {
      labels: usersData.map(u => u.label),
      datasets: [{
        label: 'Weekly Registered Users',
        data: usersData.map(u => u.value),
        borderColor: lineColor,
        backgroundColor: fillColor,
        tension: 0.3,
        fill: true,
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio,
      plugins: {
        title: {
          display: true,
          text: this.chartTitle,
          font: { size: 16 },
          color: textColor,
        },
        legend: {
          display: true,
          onClick: () => {},
          labels: {
            color: textColor,
            font: { size: 13 }
          }
        }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }}
      }
    };
  }


