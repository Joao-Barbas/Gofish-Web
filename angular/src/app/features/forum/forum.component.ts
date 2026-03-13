import { filter } from 'rxjs';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/features/footer/footer.component';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Path } from '@gofish/shared/constants';

type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-forum',
  imports: [ RouterLink, RouterLinkActive, FlatHeaderComponent, FooterComponent, RouterOutlet ],
  templateUrl: './forum.component.html',
  styleUrl: "./forum.component.css"
})
export class ForumComponent {
  private readonly router: Router = inject(Router);
  public currentPath: WritableSignal<string> = signal(this.router.url);

  public navPaths: NavPath[] = [
    { path: Path.FORUM_DISCOVER,      label: 'Discover'      },
    { path: Path.FORUM_FROM_FRIENDS,  label: 'From Friends'  },
    { path: Path.FORUM_MY_GROUPS,     label: 'My Groups'     },
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
