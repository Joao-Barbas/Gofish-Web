import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import mapboxgl, { MapMouseEvent } from 'mapbox-gl';

import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { PinService } from '@gofish/shared/services/map-services/pin.service';
import { PinfactoryService } from '@gofish/shared/services/map-services/pinfactory.service';

import { CreatePinComponent } from './create-pin/create-pin.component';

import { Coords, PinType } from '@gofish/shared/models/pin-types';
import { GetPinsInViewportResDTO, PinMarkerDTO } from '@gofish/shared/dtos/pin-marker.dto';
import { WaterValidationService } from '@gofish/shared/services/map-services/water-validation.service';
import { PreviewMarkerService } from '@gofish/shared/services/map-services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/shared/services/map-services/marker-registry.service';



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, CreatePinComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  // UI / state
  firstName = '';
  selected: Coords | null = null;

  pickingOnMap = false;
  isCreating: boolean = false;

  // Mapbox
  private map!: mapboxgl.Map;


  constructor(
    private router: Router,
    private pinService: PinService,
    private authService: AuthService,
    private userService: UserService,
    private pinFactory: PinfactoryService,
    private waterValidationService: WaterValidationService,
    private previewMarkerService: PreviewMarkerService,
    private markerRegistry: MarkerRegistryService
  ) { }

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => (this.firstName = res.firstName),
      error: (err: any) =>
        console.log('Error while retrieving user profile:\n', err),
    });
  }

  ngAfterViewInit(): void {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/goncalopro2/cmkpidm7e003601s526nugcv1',
      center: [-8.8882, 38.5243],
      zoom: 13,
      maxZoom: 13,
      minZoom: 4,
      pitch: 0,
      bearing: 0,
    });

    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();

    this.map.on('load', () => {
      this.loadPinsInViewport();

      this.map.on('moveend', () => this.loadPinsInViewport());
      this.map.on('zoomend', () => this.loadPinsInViewport());
      this.map.on('click', (e) => this.onMapClick(e));

    });
  }


  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

    const isWater = this.waterValidationService.isWaterAtPoint(this.map, e.point);

    if (!isWater) {
      console.log('Only create pins on water.');
      return;
    }

    const { lng, lat } = e.lngLat;
    const coords: Coords = { latitude: lat, longitude: lng };

    this.setSelectedCoords(coords);

    this.disablePickMode();
  }

  ngOnDestroy(): void {
    this.previewMarkerService.clear();
    this.markerRegistry.clear();

    if (this.map) this.map.remove();
  }

  // =========================
  // Create / Pick mode
  // =========================
  startCreate(): void {
    this.isCreating = true;
  }

  enablePickMode(): void {
    this.isCreating = true;
    this.pickingOnMap = true;
    this.map.getCanvas().style.cursor = 'crosshair';
    console.log('Pick mode enabled');
  }

  private disablePickMode(): void {
    this.pickingOnMap = false;
    this.map.getCanvas().style.cursor = 'default';
  }



  onCoordsSelected(coords: Coords): void {
    if (!this.waterValidationService.isWaterAtLngLat(this.map, coords.longitude, coords.latitude)) {
      alert('Selected coordinates are not on water. Please select a valid location.');
      return;
    }

    this.setSelectedCoords(coords);
    this.disablePickMode();
  }

  onPinCreated(): void {
    this.clearPreviewAndSelection();
    this.disablePickMode();
    this.loadPinsInViewport();

    this.isCreating = false;
    console.log('Pin created successfully.');
  }

  onPinCreateFailed(msg: string): void {
    console.error('Failed create pin:', msg);
    this.disablePickMode();
    this.clearPreviewAndSelection();
    this.isCreating = false;
  }

  // =========================
  // Selection / Preview marker
  // =========================
  private setSelectedCoords(coords: Coords): void {
    this.selected = coords;

    this.previewMarkerService.clear();
    this.previewMarkerService.set(this.map, coords.longitude, coords.latitude, (lng, lat) => this.pinFactory.createPreviewPin(lng, lat));

    this.map.setCenter([coords.longitude, coords.latitude]);
  }

  private clearPreviewAndSelection(): void {
    this.previewMarkerService.clear();
    this.selected = null;
  }

  // =========================
  // Pins in viewport
  // =========================
  private loadPinsInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    if (!bounds) return;

    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    this.getPinsInViewport(minLat, minLng, maxLat, maxLng);
  }

  private getPinsInViewport(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ): void {
    this.pinService.getInViewport(minLat, minLng, maxLat, maxLng).subscribe({
      next: (res: GetPinsInViewportResDTO) => {
        if (!res.success) return;
        this.markerRegistry.loadPins(this.map, res.pins, (pin) => this.pinFactory.createPin(pin));
      },
      error: (err: any) => {
        console.error('Erro GetInViewport:', err);
      },
    });
  }

  // =========================
  // Auth
  // =========================
  onSignOut(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }
}
