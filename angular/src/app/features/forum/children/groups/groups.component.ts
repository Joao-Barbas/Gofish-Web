import { filter } from 'rxjs';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { UserPopupComponent } from "@gofish/features/header/header-actions/components/user-popup/user-popup.component";
import { GroupMemberSettingsPopoverComponent } from "./components/group-member-settings-popover/group-member-settings-popover.component";


type NavPath = {
  path: string;
  label: string;
}

@Component({
  selector: 'app-groups',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UserPopupComponent, GroupMemberSettingsPopoverComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
    private readonly router: Router = inject(Router);
    public currentPath: WritableSignal<string> = signal(this.router.url);

    public navPaths: NavPath[] = [
      { path: Path.FORUM_GROUPS_test_posts,      label: 'Posts'      },
      { path: Path.FORUM_GROUPS_test_members,      label: 'Members'      },
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
