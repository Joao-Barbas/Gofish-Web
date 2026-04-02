import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'gf-user-help-box',
  imports: [],
  templateUrl: './user-help-box.component.html',
  styleUrl: './user-help-box.component.css',
})
export class UserHelpBoxComponent {
  type = input<'tooltip' | 'alert'>('tooltip');
  headerText = input<string>("header text here");
  bodyText = input<string>("body text here");


}
