// flat-header.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderActionsComponent } from '../header-actions/header-actions.component';

@Component({
  selector: 'app-flat-header',
  imports: [RouterLink, RouterLinkActive, HeaderActionsComponent],
  templateUrl: './flat-header.component.html',
  styleUrl: './flat-header.component.css'
})
export class FlatHeaderComponent {}
