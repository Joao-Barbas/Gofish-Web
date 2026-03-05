/* flyout-header.component.ts */

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '../header-actions/header-actions.component';

@Component({
  selector: 'app-overlay-header',
  imports: [ RouterLink, RouterLinkActive, HeaderActionsComponent ],
  templateUrl: './overlay-header.component.html',
  styleUrl: './overlay-header.component.css'
})
export class OverlayHeaderComponent {}
