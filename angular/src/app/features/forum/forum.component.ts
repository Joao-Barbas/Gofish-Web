import { filter } from 'rxjs';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Path } from '@gofish/shared/constants';

/**
 * Represents a forum navigation entry.
 */
type NavPath = {
  /** Route path used for navigation. */
  path: string;

  /** Label displayed to the user. */
  label: string;
}

/**
 * Root container component for the forum feature.
 *
 * Responsibilities:
 * - Expose forum navigation entries
 * - Track the currently active route
 * - Render child forum routes
 * - Handle navigation changes from the UI
 */
@Component({
  selector: 'app-forum',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './forum.component.html',
  styleUrl: "./forum.component.css"
})
export class ForumComponent {
  private readonly router: Router = inject(Router);

  /** Stores the current router URL for active navigation tracking. */
  public currentPath: WritableSignal<string> = signal(this.router.url);

  /** Available navigation entries for the forum section. */
  public navPaths: NavPath[] = [
    { path: Path.FORUM_DISCOVER, label: 'Discover' },
    { path: Path.FORUM_FROM_FRIENDS, label: 'From Friends' },
    { path: Path.FORUM_MY_GROUPS, label: 'My Crews' },
  ];

  /**
   * Subscribes to router navigation events and updates the
   * current path when navigation completes.
   */
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event: NavigationEnd) => {
      this.currentPath.set(event.urlAfterRedirects);
    });
  }

  /**
   * Handles navigation selection changes from the UI.
   *
   * @param event DOM event triggered by the navigation selector
   */
  public onNavSelectChange(event: Event) {
    var select = event.target as HTMLSelectElement;
    this.router.navigate([select.value]);
  }
}
