// leaderboard.component.ts

import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom, map } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { UserApi } from '@gofish/shared/api/user.api';
import { AuthService } from '@gofish/shared/services/auth.service';
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { Path, Rank } from '@gofish/shared/constants';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AbsPipe } from "../../shared/pipes/absolute.pipe";
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { LeaderboardUserDTO } from '@gofish/shared/dtos/user.dto';

type LeaderboardTab = 'global' | 'friends';

@Component({
  selector: 'gf-leaderboard',
  imports: [RouterLink, LoadingErrorModalComponent, LoadingSpinnerComponent, AbsPipe, UserTitleComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent {
  readonly activeTab = input<LeaderboardTab | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=
  readonly activeTabOrDefault = computed<LeaderboardTab>(() => this.activeTab() ?? 'global' )

  readonly userApi       = inject(UserApi);
  readonly authService   = inject(AuthService);
  readonly router        = inject(Router);
  readonly route         = inject(ActivatedRoute);
  readonly avatarService = inject(AvatarService)

  window = window;
  Path = Path;
  Rank = Rank;

  leaderboard = resource({
    params: () => this.activeTabOrDefault(),
    loader: ({ params: tab }) => {
      console.log(tab);
      return firstValueFrom(tab === 'global'
      ? this.userApi.getGlobalLeaderboard()
      : this.userApi.getFriendsLeaderboard()
  )}});

  readonly topThree   = computed(() => this.leaderboard.value()?.entries.slice(0, 3) ?? []);
  readonly rest       = computed(() => this.leaderboard.value()?.entries.slice(3)    ?? []);
  readonly allEntries = computed(() => this.leaderboard.value()?.entries             ?? []);










  // private readonly avatarService = inject(AvatarService);
  // private readonly leaderboardApi = inject(LeaderboardApi);

  // readonly activeTab = toSignal(
  //   this.route.queryParamMap.pipe(
  //     map(params => (params.get('tab') as LeaderboardTab) ?? 'global')
  //   ),
  //   { initialValue: 'global' as LeaderboardTab }
  // );

  // TODO: Replace with real API data
  // readonly entries = signal<LeaderboardUserDTO[]>([
  //   { position: 1, rank: 1, userId: '1', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 130, catchPointsDelta: 55, weeklyStreak: 9 },
  //   { position: 2, rank: 5, userId: '2', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: -55, weeklyStreak: 9 },
  //   { position: 3, rank: 4, userId: '3', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: 0, weeklyStreak: 9 },
  //   { position: 4, rank: 1, userId: '4', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: 55, weeklyStreak: 9 },
  //   { position: 5, rank: 1, userId: '5', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: 55, weeklyStreak: 9 },
  //   { position: 6, rank: 1, userId: '6', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: -55, weeklyStreak: 9 },
  //   { position: 7, rank: 5, userId: '7', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: 55, weeklyStreak: 9 },
  //   { position: 8, rank: 1, userId: '8', firstName: 'FirstName', lastName: 'LastName', userName: 'Username', catchPoints: 99, catchPointsDelta: 55, weeklyStreak: 9 },
  // ]);

  // readonly topThree = computed(() => this.entries().slice(0, 3));
  // readonly rest = computed(() => this.entries().slice(3));
  // readonly allEntries = computed(() => this.entries());
}
