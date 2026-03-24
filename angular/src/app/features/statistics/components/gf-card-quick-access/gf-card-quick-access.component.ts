import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from "@angular/router";

export type QuickAccessType =
  | 'average-published-pins'
  | 'pin-density'
  | 'reports';

@Component({
  selector: 'app-gf-card-quick-access',
  imports: [RouterLink, NgClass],
  templateUrl: './gf-card-quick-access.component.html',
  styleUrl: './gf-card-quick-access.component.css',
})
export class GfCardQuickAccessComponent {
  @Input() type: QuickAccessType = 'average-published-pins';
  @Input() title: string = '';
  @Input() extraTexts: string[] = [];

}
