// map.component.ts
import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PinService } from '@gofish/features/map/services/pin.service';
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


const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

@Component({
  selector: 'app-test-delete-after',
  imports: [CommonModule,
    FormsModule,
    ClusterDetailsComponent, GfCardPinPreviewComponent],
  templateUrl: './test-delete-after.component.html',
  styleUrl: './test-delete-after.component.css',
})
export class TestDELETEAFTERComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {

  }

  protected selectedPins = signal<PinDataResDTO[]>([
  {
    id: 1,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    visibility: 1,
    kind: 1,
    author: {
      id: 'user-001',
      userName: 'ricardoreis',
    },
    post: {
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cuidado cuidado cuidado!',
      score: 999,
      commentCount: 999,
      imageUrl: 'assets/images/placeholder_profile_pic.png',
    },
    details: {
      species: 1,
      bait: 1,
      hookSize: 'M',
      accessDificulty: 1,
      seabed: 1,
      warningKind: 0,
    },
  },
  {
    id: 2,
    createdAt: new Date(Date.now() - 33 * 1000).toISOString(),
    visibility: 1,
    kind: 1,
    author: {
      id: 'user-001',
      userName: 'ricardoreis',
    },
    post: {
      body: 'aaaaaaaaa',
      score: 0,
      commentCount: 0,
      imageUrl: 'assets/images/placeholder_profile_pic.png',
    },
    details: {
      species: 2,
      bait: 2,
      hookSize: 'S',
      accessDificulty: 2,
      seabed: 2,
      warningKind: 0,
    },
  },
]);

  private readonly previewMarkerService = inject(PreviewMarkerService);

  selectedCoords = signal<Coords | null>(null);
  protected selectedPin = signal<PinDataResDTO | null>(null);
  private clearPreviewAndSelection(): void {
    this.previewMarkerService.clear();
    this.selectedCoords.set(null);
  }

  readonly popupService = inject(PopupService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  onPopupCancel(key: PopupKey): void {
    this.clearPreviewAndSelection();
    this.popupService.toggle(key);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: null, sLat: null, sLng: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  onPopupCancelPinPreview(): void { this.onPopupCancel('pin-preview'); }

}
