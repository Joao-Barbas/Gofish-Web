// loading-spinner.component.ts

import { Component, input } from '@angular/core';

@Component({
  selector: 'gf-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent {
  readonly text = input<string | null>(null);
  readonly size = input<number>(48);
}
