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

/**
 * Supported leaderboard tabs.
 */
type LeaderboardTab = 'global' | 'friends';

/**
 * Leaderboard page component.
 *
 * Responsibilities:
 * - Resolve the active leaderboard tab from component input
 * - Load leaderboard data from the backend
 * - Expose derived leaderboard sections for the template
 * - Provide access to shared constants and helper services
 */
@Component({
  selector: 'gf-leaderboard',
  imports: [RouterLink, LoadingErrorModalComponent, LoadingSpinnerComponent, AbsPipe, UserTitleComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent {
  /**
   * Active leaderboard tab provided through component input.
   * The input is aliased as "tab".
   */
  readonly activeTab = input<LeaderboardTab | undefined>(undefined, { alias: 'tab' });

  /**
   * Returns the active tab or falls back to the global leaderboard.
   */
  readonly activeTabOrDefault = computed<LeaderboardTab>(() => this.activeTab() ?? 'global');

  /** API used to retrieve leaderboard data. */
  readonly userApi = inject(UserApi);

  /** Service used to access authentication state. */
  readonly authService = inject(AuthService);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Current activated route. */
  readonly route = inject(ActivatedRoute);

  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** Exposes the global window object to the template. */
  window = window;

  /** Shared route path constants used in templates. */
  Path = Path;

  /** Shared rank constants used in templates. */
  Rank = Rank;

  /**
   * Reactive resource used to load leaderboard data according to
   * the currently selected tab.
   *
   * Behavior:
   * - Loads the global leaderboard when the active tab is "global"
   * - Loads the friends leaderboard when the active tab is "friends"
   * - Automatically reloads when the active tab changes
   */
  leaderboard = resource({
    params: () => this.activeTabOrDefault(),
    loader: ({ params: tab }) => firstValueFrom(
      tab === 'global'
        ? this.userApi.getGlobalLeaderboard()
        : this.userApi.getFriendsLeaderboard()
    )
  });

  /**
   * Returns the first three leaderboard entries.
   */
  readonly topThree = computed(() => this.leaderboard.value()?.entries.slice(0, 3) ?? []);

  /**
   * Returns the leaderboard entries after the top three.
   */
  readonly rest = computed(() => this.leaderboard.value()?.entries.slice(3) ?? []);

  /**
   * Returns all leaderboard entries.
   */
  readonly allEntries = computed(() => this.leaderboard.value()?.entries ?? []);

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
