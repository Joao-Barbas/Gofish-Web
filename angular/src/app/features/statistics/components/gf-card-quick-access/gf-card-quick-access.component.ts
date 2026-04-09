import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from "@angular/router";

export type QuickAccessType =
  | 'average-published-pins'
  | 'pin-density-by-location'
  | 'reports';

@Component({
  selector: 'app-gf-card-quick-access',
  imports: [RouterLink, NgClass],
  templateUrl: './gf-card-quick-access.component.html',
  styleUrl: './gf-card-quick-access.component.css',
})
export class GfCardQuickAccessComponent {
  @Input() type: QuickAccessType = 'reports';
  @Input() title: string = '';
  @Input() extraTexts: string[] = [];

}
