// user-title.component.ts

import { Component, input } from '@angular/core';

@Component({
  selector: 'gf-user-title',
  templateUrl: './user-title.component.html',
  styleUrl: './user-title.component.css',
})
export class UserTitleComponent {
  readonly text = input.required<string>();
  readonly rank = input.required<number>();
}
