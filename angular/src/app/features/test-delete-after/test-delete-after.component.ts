// map.component.ts
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PinService } from '@gofish/shared/services/pin.service';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailPanelComponent } from '../map/components/pin-detail-panel/pin-detail-panel.component';
import { OverlayHeaderComponent } from '@gofish/features/header/overlay-header/overlay-header.component';
import { ViewportPinsResDTO, ViewportPinDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { PinKind } from '@gofish/shared/models/pin.model';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { PopupKey } from '@gofish/shared/models/popup.model';
import { NgxSonnerToaster } from 'ngx-sonner';
import { RouterOutlet } from '@angular/router';

import { MapLayersService } from '@gofish/features/map/services/map-layers.service';
import { MapInteractionsService } from '@gofish/features/map/services/map-interactions.service';
import { ClusterDetailsComponent } from '@gofish/features/map/components/cluster-details/cluster-details.component';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";


import { UsersChartComponent } from '@gofish/shared/components/users-chart/users-chart.component';
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';

@Component({
  selector: 'app-test-delete-after',
  imports: [UsersChartComponent],
  templateUrl: './test-delete-after.component.html',
  /*styleUrl: './test-delete-after.component.css',*/
})
export class TestDELETEAFTERComponent {
  mockUsers = MOCK_USERS;

}



export const MOCK_USERS: Partial<GetUserProfileResDTO>[] = [
  // Semana 1 Mar (3/3 a 9/3) — 5 utilizadores (12.5%)
  { joinedAt: '2025-03-03T09:00:00' },
  { joinedAt: '2025-03-04T11:00:00' },
  { joinedAt: '2025-03-05T14:00:00' },
  { joinedAt: '2025-03-06T16:00:00' },
  { joinedAt: '2025-03-07T10:00:00' },

  // Semana 2 Mar (10/3 a 16/3) — 3 utilizadores (7.5%)
  { joinedAt: '2025-03-10T09:30:00' },
  { joinedAt: '2025-03-12T13:00:00' },
  { joinedAt: '2025-03-14T17:00:00' },

  // Semana 3 Mar (17/3 a 23/3) — 8 utilizadores (20%)
  { joinedAt: '2025-03-17T08:00:00' },
  { joinedAt: '2025-03-17T12:00:00' },
  { joinedAt: '2025-03-18T10:00:00' },
  { joinedAt: '2025-03-19T14:00:00' },
  { joinedAt: '2025-03-20T09:00:00' },
  { joinedAt: '2025-03-21T11:00:00' },
  { joinedAt: '2025-03-22T15:00:00' },
  { joinedAt: '2025-03-23T16:00:00' },

  // Semana 4 Mar (24/3 a 30/3) — 4 utilizadores (10%)
  { joinedAt: '2025-03-24T09:00:00' },
  { joinedAt: '2025-03-26T13:00:00' },
  { joinedAt: '2025-03-28T15:00:00' },
  { joinedAt: '2025-03-29T17:00:00' },

  // Semana 1 Abr (31/3 a 6/4) — 6 utilizadores (15%)
  { joinedAt: '2025-03-31T10:00:00' },
  { joinedAt: '2025-04-01T11:00:00' },
  { joinedAt: '2025-04-02T14:00:00' },
  { joinedAt: '2025-04-03T09:00:00' },
  { joinedAt: '2025-04-04T16:00:00' },
  { joinedAt: '2025-04-05T13:00:00' },

  // Semana 2 Abr (7/4 a 13/4) — 3 utilizadores (7.5%)
  { joinedAt: '2025-04-07T09:00:00' },
  { joinedAt: '2025-04-09T14:00:00' },
  { joinedAt: '2025-04-11T17:00:00' },

  // Semana 3 Abr (14/4 a 20/4) — 9 utilizadores (22.5%)
  { joinedAt: '2025-04-14T08:00:00' },
  { joinedAt: '2025-04-14T12:00:00' },
  { joinedAt: '2025-04-15T10:00:00' },
  { joinedAt: '2025-04-16T14:00:00' },
  { joinedAt: '2025-04-17T09:00:00' },
  { joinedAt: '2025-04-17T15:00:00' },
  { joinedAt: '2025-04-18T11:00:00' },
  { joinedAt: '2025-04-19T13:00:00' },
  { joinedAt: '2025-04-20T16:00:00' },

  // Semana 4 Abr (21/4 a 27/4) — 2 utilizadores (5%)
  { joinedAt: '2025-04-22T10:00:00' },
  { joinedAt: '2025-04-25T14:00:00' },
];
