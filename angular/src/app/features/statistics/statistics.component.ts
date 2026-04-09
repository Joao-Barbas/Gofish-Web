import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router, /*RouterLink, RouterLinkActive,*/ RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Path } from '@gofish/shared/constants';
import { filter } from 'rxjs';

type NavPath = {
  path: string;
  label: string;
}


@Component({
  selector: 'app-statistics',
  imports: [RouterOutlet],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent {
  private readonly router: Router = inject(Router);
  public currentPath: WritableSignal<string> = signal(this.router.url);

  public showBackButton = computed(() => {
    const url = this.currentPath();
    const isHome = url.endsWith('/statistics/home') || url.endsWith('/statistics');
    return !isHome && url.includes('/statistics/');
  });

  public goBack() {
    /* const url = this.currentPath();

    const segments = url.split('/');
    if (segments.length > 1) {
      segments.pop(); // Remove a última "pasta"
      const parentPath = segments.join('/');
      this.router.navigateByUrl(parentPath);
    } */
   this.router.navigate(['/statistics/home']);
  }



  public navPaths: NavPath[] = [
    { path: Path.STATISTICS, label: 'home' },
    { path: Path.STATISTICS_AVG_PUBLISHED, label: 'average-published-pins' },
    { path: Path.STATISTICS_REPORTS, label: 'reports' },
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
