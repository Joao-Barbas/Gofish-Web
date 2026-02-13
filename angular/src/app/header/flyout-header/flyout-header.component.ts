/* flyout-header.component.ts */

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '../header-actions/header-actions.component';

@Component({
  selector: 'app-flyout-header',
  imports: [RouterLink, RouterLinkActive, HeaderActionsComponent],
  templateUrl: './flyout-header.component.html',
  styleUrl: './flyout-header.component.css'
})
export class FlyoutHeaderComponent {}
