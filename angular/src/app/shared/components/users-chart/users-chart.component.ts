import { Component } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'gf-users-chart',
  imports: [NgxChartsModule],
  templateUrl: './users-chart.component.html',
  styleUrl: './users-chart.component.css',
})
export class UsersChartComponent {

  chartData = [
    {
      name: 'Utilizadores Criados',
      series: [
        { name: 'Semana 1', value: 120 },
        { name: 'Semana 2', value: 85 },
        { name: 'Semana 3', value: 200 },
        { name: 'Semana 4', value: 150 },
      ]
    }
  ];

  colorScheme = 'cool';

}
