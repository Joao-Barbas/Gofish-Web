// settings.component.ts

import { Component, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlatHeaderComponent } from "@gofish/features/header/flat-header/flat-header.component";
import { Path } from '@gofish/shared/constants';
import { filter } from 'rxjs';

type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-settings',
  imports: [ RouterLink, RouterLinkActive, RouterOutlet, FlatHeaderComponent ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  private readonly router: Router = inject(Router);

  public currentPath: WritableSignal<string> = signal(this.router.url);
  public navPaths: NavPath[] = [
    { path: Path.SETTINGS.GENERAL,       label: 'General'       },
    { path: Path.SETTINGS.SECURITY,      label: 'Security'      },
    { path: Path.SETTINGS.PERSONAL_DATA, label: 'Personal Data' },
  ];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event: NavigationEnd) => {
      this.currentPath.set(event.urlAfterRedirects);
    });
  }

  public onNavSelectChange(event: Event) {
    var select = event.target as HTMLSelectElement;
    this.router.navigate([select.value]);
  }
}
