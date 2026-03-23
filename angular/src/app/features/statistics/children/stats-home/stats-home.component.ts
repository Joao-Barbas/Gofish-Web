import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './stats-home.component.html',
  styleUrl: './stats-home.component.css',
})
export class StatsHomeComponent {
  private readonly router = inject(Router);

}
