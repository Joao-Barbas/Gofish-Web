// settings.component.ts

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlatHeaderComponent } from "@gofish/features/header/flat-header/flat-header.component";
import { RoutePath } from '@gofish/shared/constants';

@Component({
  selector: 'app-settings',
  imports: [ RouterLink, RouterLinkActive, RouterOutlet, FlatHeaderComponent ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  public readonly router = inject(Router);
  public readonly routes = RoutePath.SETTINGS;

  public onNavSelectChange(event: Event) {
    var select = event.target as HTMLSelectElement;
    this.router.navigate([`${this.routes.ROOT}/${select.value}`]);
  }
}
