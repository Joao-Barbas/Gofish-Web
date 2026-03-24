import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QuickViewType =
  | 'system-requests'
  | 'satisfaction-index'
  | 'positive-votes'
  | 'pins-today'
  | 'active-users';

@Component({
  selector: 'app-gf-card-quick-view',
  imports: [],
  templateUrl: './gf-card-quick-view.component.html',
  styleUrl: './gf-card-quick-view.component.css',
})
export class GfCardQuickViewComponent {
  @Input() type: QuickViewType = 'system-requests';
  @Input() bigText: string = '';
  @Input() littleText: string = '';
  
}
