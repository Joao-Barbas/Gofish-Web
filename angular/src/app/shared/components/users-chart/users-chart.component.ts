import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';

Chart.register(...registerables);

@Component({
  selector: 'gf-users-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './users-chart.component.html',
  styleUrl: './users-chart.component.css',
})
export class UsersChartComponent implements OnChanges {

  @Input() users: Partial<GetUserProfileResDTO>[] = [];

  private getCssVar(variable: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  }

  private hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {};

  ngOnChanges(): void {
    this.buildChart();
  }

  private buildChart(): void {
    const groups: Record<string, number> = {};

    for (const user of this.users) {
      if (!user.joinedAt) continue;
      const week = this.getWeekLabel(new Date(user.joinedAt));
      groups[week] = (groups[week] ?? 0) + 1;
    }

    const lineColor = this.getCssVar('--gf-primary');
    const textColor = this.getCssVar('--gf-dark-text-muted');
    const fillColor = this.getCssVar('--gf-dark-text-muted-opacity-50');

    this.chartData = {
      labels: Object.keys(groups),
      datasets: [{
        label: 'Weekly Registered Users',
        data: Object.values(groups),
        borderColor: lineColor,
        backgroundColor: fillColor,
        tension: 0.3,
        fill: true,
      }]
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
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
        x: {
          ticks: { color: textColor },
          grid: { color: fillColor },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: fillColor },
        }
      }
    };
  }

  private getWeekLabel(date: Date): string {
    const day = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - ((day + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const format = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    return `${format(start)} a ${format(end)} de ${date.getFullYear()}`;
  }
}
