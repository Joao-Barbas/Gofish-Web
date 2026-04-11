// pins.component.ts

import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { PinApi } from '@gofish/shared/api/pin.api';
import { UserApi } from '@gofish/shared/api/user.api';
import { GetPinsResDto, GetPinsResDTO, PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { Router, RouterLink } from '@angular/router';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { PinKind } from '@gofish/shared/models/pin.model';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { Path, PathSegment } from '@gofish/shared/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";

/**
 * Displays the list of pins associated with the current profile.
 *
 * Responsibilities:
 * - Load the initial set of profile pins
 * - Maintain pagination state for additional pins
 * - Expose filtered pin lists based on the active tab
 * - Expose pin counts grouped by pin kind
 * - Track loading and busy states during pagination
 */
@Component({
  selector: 'app-pins',
  imports: [
    LoadingSpinnerComponent,
    RouterLink,
    AsyncButtonComponent,
    GfCardPinPreviewComponent,
    LoadingErrorModalComponent
  ],
  templateUrl: './pins.component.html',
  styleUrl: './pins.component.css',
})
export class PinsComponent {
  /**
   * Active tab provided to the component.
   * The input is aliased as "tab".
   */
  readonly activeTab = input<string | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=

  /** API used to retrieve user-related data. */
  readonly userApi        = inject(UserApi);

  /** API used to retrieve pin-related data. */
  readonly pinApi         = inject(PinApi);

  /** Profile context used to access the currently viewed profile. */
  readonly profileContext = inject(ProfileContext);

  /** Service used to access authentication state. */
  readonly authService    = inject(AuthService);

  /** Router instance used for navigation actions. */
  readonly router         = inject(Router);

  /** Loading state used for UI feedback during pagination. */
  readonly loadingState = new LoadingState();

  /** Busy state used to prevent overlapping load operations. */
  readonly busyState    = new BusyState();

  /** Exposes the global window object to the template if needed. */
  readonly window      = window;

  /** Pin kind enum exposed to the template. */
  readonly PinKind     = PinKind;

  /** Shared route path constants used in templates and navigation. */
  readonly Path        = Path;

  /** Shared route path segment constants used in templates. */
  readonly PathSegment = PathSegment;

  /** Cursor used to paginate pins by timestamp. */
  pinsCursor  = signal<string | undefined>(undefined);

  /** Indicates whether more pins are available to load. */
  pinsHasMore = signal(true);

  /** Stores the currently loaded list of pins. */
  pinsList    = signal<PinDto[]>([]);

  /**
   * Reactive resource used to load the initial batch of pins
   * for the current profile.
   */
  pins = resource({
    params: () => this.profileContext.userProfileId(),
    loader: ({ params: id }) => firstValueFrom(this.pinApi.getPins({
      ids: [{ authorId: id }],
      dataRequest: {
        includeAuthor: true,
        includeStats: true,
        includeDetails: true,
      },
      maxResults: 20,
      lastTimestamp: undefined
    }))
  });

  /**
   * Returns pin counts grouped by pin kind.
   */
  counts = computed(() => ({
    all:         this.pinsList().length,
    catch:       this.pinsList().filter(p => p.kind === PinKind.CATCH).length,
    information: this.pinsList().filter(p => p.kind === PinKind.INFORMATION).length,
    warning:     this.pinsList().filter(p => p.kind === PinKind.WARNING).length,
  }));

  /**
   * Returns the pins filtered according to the active tab.
   */
  filteredPins = computed(() => {
    const tab = this.activeTab() ?? 'all';
    const list = this.pinsList();
    switch (tab) {
      case 'catch':       return list.filter(p => p.kind === PinKind.CATCH);
      case 'information': return list.filter(p => p.kind === PinKind.INFORMATION);
      case 'warning':     return list.filter(p => p.kind === PinKind.WARNING);
      default:            return list;
    }
  });

  /**
   * Synchronizes the loaded resource data into local signals
   * used by the template and pagination flow.
   */
  constructor() {
    effect(() => {
      if (!this.pins.hasValue()) return;
      this.pinsList.set(this.pins.value().pins);
      this.pinsHasMore.set(this.pins.value().hasMoreResults);
      this.pinsCursor.set(this.pins.value().lastTimestamp);
    })
  }

  /**
   * Loads the next batch of pins for the current profile.
   */
  loadMorePins() {
    let profileId = this.profileContext.userProfileId();
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.pinApi.getPins({
      ids: [{ authorId: profileId }],
      dataRequest: {
        includeAuthor: true,
        includeStats: true,
        includeDetails: true,
      },
      maxResults: 20,
      lastTimestamp: this.pinsCursor()
    }).subscribe({
      next: (res: GetPinsResDto) => {
        this.pinsList.update(list => [...list, ...res.pins]);
        this.pinsHasMore.set(res.hasMoreResults);
        this.pinsCursor.set(res.lastTimestamp);
        this.loadingState.success();
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.');
        this.busyState.setBusy(false);
      }
    })
  }
}
