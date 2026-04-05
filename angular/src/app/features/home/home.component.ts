import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { StatsService } from '@gofish/shared/services/stats.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly statsService = inject(StatsService);

  totalPins: number = 0;
  totalCatches: number = 0;
  totalWarnings: number = 0;

  ngOnInit(): void {
    this.statsService.getTotalPinsCreated().subscribe({
      next: (res) => this.totalPins = res.value
    });

    this.statsService.getTotalCatchPinsCreated().subscribe({
      next: (res) => this.totalCatches = res.value
    });

    this.statsService.getTotalWarningPinsCreated().subscribe({
      next: (res) => this.totalWarnings = res.value
    });
  }
}
