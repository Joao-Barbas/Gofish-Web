import { Component, OnInit, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface PinMonthStats {
  monthName: string;
  year: number;
  catchCount: number;
  infoCount: number;
  warningCount: number;
}

@Component({
  selector: 'gf-pins-average-published-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './pins-avg-published-chart.component.html',
  styleUrl: './pins-avg-published-chart.component.css',
})
export class PinsAvgPublishedChart implements OnInit {

  pinStats = input<PinMonthStats>();

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Catch Pins', 'Info Pins', 'Warning Pins'],
    datasets: [{ data: [0, 0, 0] }]
  };

  public chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '75%',
  };

  ngOnInit(): void {
    this.buildChart();
  }

  private getCssVar(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#ccc';
  }

  private buildChart(): void {

    const stats = this.pinStats();

    if (!stats) return;

    const catchColor = this.getCssVar('--gf-catch-pin');
    const infoColor = this.getCssVar('--gf-info-pin');
    const warnColor = this.getCssVar('--gf-warning-pin');

    this.doughnutChartData = {
      labels: ['Catch Pins', 'Info Pins', 'Warning Pins'],
      datasets: [{
        data: [stats.catchCount, stats.infoCount, stats.warningCount],
        backgroundColor: [catchColor, infoColor, warnColor],
        hoverOffset: 4,
        borderWidth: 0
      }]
    };
  }
}
