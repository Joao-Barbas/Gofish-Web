// pins.component.ts

import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { PinApi } from '@gofish/shared/api/pin.api';
import { UserApi } from '@gofish/shared/api/user.api';
import { GetPinsResDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { RouterLink } from '@angular/router';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { PinKind } from '@gofish/shared/models/pin.model';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { Path, PathSegment } from '@gofish/shared/constants';
import { TimeAgoPipe } from "@gofish/shared/pipes/time-ago.pipe";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pins',
  imports: [
    LoadingSpinnerComponent,
    RouterLink,
    AsyncButtonComponent,
    GfCardPinPreviewComponent,
    TimeAgoPipe
],
  templateUrl: './pins.component.html',
  styleUrl: './pins.component.css',
})
export class PinsComponent {
  readonly activeTab = input<string | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=

  readonly userApi        = inject(UserApi);
  readonly pinApi         = inject(PinApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService    = inject(AuthService);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  PinKind     = PinKind;
  Path        = Path;
  PathSegment = PathSegment;

  pinsCursor  = signal<string | undefined>(undefined);
  pinsHasMore = signal(true);
  pinsList    = signal<PinDataResDTO[]>([]);

  user = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUser(id))
  });

  pins = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.pinApi.getPins({
      ids: [{ authorId: id }],
      dataRequest: {
        includeAuthor: true,
        includePost: true,
        includeDetails: true,
      },
      maxResults: 20,
      lastTimestamp: undefined
    }))
  });

  counts = computed(() => ({
    all: this.pinsList().length,
    catch: this.pinsList().filter(p => p.kind === PinKind.CATCH).length,
    information: this.pinsList().filter(p => p.kind === PinKind.INFORMATION).length,
    warning: this.pinsList().filter(p => p.kind === PinKind.WARNING).length,
  }));

  constructor() {
    effect(() => {
      if (!this.pins.hasValue()) return;
      this.pinsList.set(this.pins.value().pins);
      this.pinsHasMore.set(this.pins.value().hasMoreResults);
      this.pinsCursor.set(this.pins.value().lastTimestamp);
    })
  }

  loadMorePins() {
    let profileId = this.profileContext.profileId();
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.pinApi.getPins({
      ids: [{ authorId: profileId }],
      dataRequest: {
        includeAuthor: true,
        includePost: true,
        includeDetails: true,
      },
      maxResults: 20,
      lastTimestamp: this.pinsCursor()
    }).subscribe({
      next: (res: GetPinsResDTO) => {
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
