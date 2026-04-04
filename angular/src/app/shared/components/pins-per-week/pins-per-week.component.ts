import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface PinWeekStats {
  weekLabel: string;
  catchCount: number;
  infoCount: number;
  warningCount: number;
}

@Component({
  selector: 'gf-pins-per-week',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './pins-per-week.component.html',
  styleUrl: './pins-per-week.component.css',
})
export class PinsPerWeekComponent implements OnInit {

  @Input() pins: PinWeekStats[] = [];

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {};

  ngOnInit(): void {
    this.buildChart();
  }

  private getCssVar(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#ccc';
  }

  private buildChart(): void {
    const catchColor = this.getCssVar('--gf-catch-pin');
    const infoColor = this.getCssVar('--gf-info-pin');
    const warnColor = this.getCssVar('--gf-warning-pin');
    const textColor = this.getCssVar('--gf-dark-text-muted');
    const gridColor = this.getCssVar('--gf-dark-text-muted-opacity-50');

    this.chartData = {
      labels: this.pins.map(p => p.weekLabel),
      datasets: [
        {
          label: 'Catch Pins',
          data: this.pins.map(p => p.catchCount),
          backgroundColor: catchColor,
        },
        {
          label: 'Info Pins',
          data: this.pins.map(p => p.infoCount),
          backgroundColor: infoColor,
        },
        {
          label: 'Warning Pins',
          data: this.pins.map(p => p.warningCount),
          backgroundColor: warnColor,
        },
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          beginAtZero: true,
        }
      },

    };
  }
}
