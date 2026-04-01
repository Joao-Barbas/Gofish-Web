// user-rank-icon.component.ts

import { Component, input } from '@angular/core';

@Component({
  selector: 'gf-user-rank-icon',
  host: {
    '[class.rank-1]': "rank() === 1",
    '[class.rank-2]': "rank() === 2",
    '[class.rank-3]': "rank() === 3",
    '[class.rank-4]': "rank() === 4",
    '[class.rank-5]': "rank() === 5"
  },
  templateUrl: './user-rank-icon.component.html',
  styleUrl: './user-rank-icon.component.css',
})
export class UserRankIconComponent {
  readonly rank = input.required<number>();
}
