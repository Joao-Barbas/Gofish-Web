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
<<<<<<< HEAD
<<<<<<< HEAD
  imports: [ RouterLink, FlatHeaderComponent, FooterComponent, RouterOutlet ],
=======
  imports: [ FlatHeaderComponent, FooterComponent, ForumPostComponent, RouterOutlet, RouterLink, RouterLinkActive ],
>>>>>>> 5ea5986 (app.routes.ts now uses constants)
=======
  imports: [ RouterLink, FlatHeaderComponent, FooterComponent, RouterOutlet ],
>>>>>>> f0e86a8 (Esqueleton of forum post feed)
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
<<<<<<< HEAD
<<<<<<< HEAD
Path: any;
=======
>>>>>>> 5ea5986 (app.routes.ts now uses constants)
=======
Path: any;
>>>>>>> f0e86a8 (Esqueleton of forum post feed)

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
