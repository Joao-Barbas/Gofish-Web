// friends.component.ts

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@gofish/features/footer/footer.component';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FriendsListComponent } from '@gofish/features/user/profile/pages/friends/components/friends-list/friends-list.component';
import { RequestsListComponent } from '@gofish/features/user/profile/pages/friends/components/requests-list/requests-list.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-friends',
  imports: [
    RouterLink,
    FlatHeaderComponent,
    FriendsListComponent,
    RequestsListComponent,
    FooterComponent
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent {
  private readonly route = inject(ActivatedRoute);

  public activeTab = toSignal(
    this.route.queryParams.pipe(map(p => p['tab'] ?? 'friends')),
    { initialValue: 'friends' }
  );
}
