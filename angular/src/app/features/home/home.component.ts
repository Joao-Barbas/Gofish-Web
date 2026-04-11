import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { StatsService } from '@gofish/shared/services/stats.service';

/**
 * Home page component that displays platform statistics.
 *
 * Responsibilities:
 * - Fetch aggregated statistics from the backend
 * - Display total counts such as pins, catches, warnings, and users
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly statsService = inject(StatsService);

  /** Total number of pins created in the platform. */
  totalPins: number = 0;

  /** Total number of catch pins created. */
  totalCatches: number = 0;

  /** Total number of warning pins created. */
  totalWarnings: number = 0;

  /** Total number of registered users (anglers). */
  totalAnglers: number = 0;

  /**
   * Loads platform statistics from the backend.
   */
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

    this.statsService.GetTotalUsers().subscribe({
      next: (res) => this.totalAnglers = res.usersRegistered
    });

    this.statsService.GetTotalUsers().subscribe({
      next: (res) => {
        this.totalAnglers = res.usersRegistered;
      },
      error: (err) => console.error('Erro ao buscar pescadores:', err)
    });
  }
}
