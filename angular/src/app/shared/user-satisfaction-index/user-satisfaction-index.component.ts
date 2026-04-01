import { Component } from '@angular/core';



@Component({
  selector: 'gf-user-satisfaction-index',
  imports: [],
  templateUrl: './user-satisfaction-index.component.html',
  styleUrl: './user-satisfaction-index.component.css',
})
export class UserSatisfactionIndexComponent {
  selected: number = 0;

  labels: Record<number, string> = {
    0: 'Select an option',
    1: 'Not satisfied at all',
    2: 'Slightly satisfied',
    3: 'Moderately satisfied',
    4: 'Quite satisfied',
    5: 'Very satisfied'
  };

  selectIndex(value: number): void {
    this.selected = this.selected === value ? 0 : value;
  }

}
