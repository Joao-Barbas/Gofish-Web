import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { CreatePinComponent } from './create-pin/create-pin.component';
import { Coords, PinType } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/pin.service';
import { GetPinsInViewportResDTO, PinMarkerDTO } from '@gofish/shared/dtos/pin-marker.dto';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, CreatePinComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  firstName = '';

  private map!: mapboxgl.Map;
  private markers = new Map<string, mapboxgl.Marker>();

  // coords selecionadas (formato do teu Coords: latitude/longitude)
  selected: Coords | null = null;

  // preview marker
  private previewMarker: mapboxgl.Marker | null = null;

  // só aceitar cliques no mapa quando estiver a escolher localização
  pickingOnMap = false;

  constructor(
    private router: Router,
    private pinService: PinService,
    private authService: AuthService,
    private userService: UserService
  ) { }

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


  enablePickMode(): void {
    this.pickingOnMap = true;
    if (this.map) this.map.getCanvas().style.cursor = 'crosshair';
  }


  onCoordsSelected(coords: Coords): void {
    this.setSelectedCoords(coords);
    this.disablePickMode();
  }


  onPinCreated(event: { dto: { latitude: number; longitude: number }; res: any }): void {
    new mapboxgl.Marker()
      .setLngLat([event.dto.longitude, event.dto.latitude])
      .addTo(this.map);

    this.clearPreviewAndSelection();
    this.disablePickMode();
    this.loadPinsInViewport();
    console.log('Pin created:', event.res);
  }

  onPinCreateFailed(msg: string): void {
    console.error('Failed create pin:', msg);
  }


  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

    const { lng, lat } = e.lngLat;

    const coords: Coords = { latitude: lat, longitude: lng };
    this.setSelectedCoords(coords);

    this.disablePickMode();
  }

  private setSelectedCoords(coords: Coords): void {
    this.selected = coords;

    if (this.previewMarker) this.previewMarker.remove();
    this.previewMarker = new mapboxgl.Marker()
      .setLngLat([coords.longitude, coords.latitude])
      .addTo(this.map);

    this.map.setCenter([coords.longitude, coords.latitude]);
  }

  private clearPreviewAndSelection(): void {
    if (this.previewMarker) {
      this.previewMarker.remove();
      this.previewMarker = null;
    }
    this.selected = null;
  }

  private disablePickMode(): void {
    this.pickingOnMap = false;
    if (this.map) this.map.getCanvas().style.cursor = '';
  }

  private loadPinsInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    if (!bounds) {
      return;
    }

    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    //console.log('BOUNDS', { minLat, minLng, maxLat, maxLng });

    this.getPinsInViewport(minLat, minLng, maxLat, maxLng);
  }

  private getPinsInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number): void {
    this.pinService.getInViewport(minLat, minLng, maxLat, maxLng)
      .subscribe({
        next: (res: GetPinsInViewportResDTO) => {
          //console.log('SUCCESS', res.success, 'PINS', res.pins.length);
          //console.log('PINS TYPE:', res.pins.map(pin => pin.pinType));
          if (!res.success) return;
          this.renderPins(res.pins);
        },
        error: (err: any) => {
          console.error('Erro GetInViewport:', err);
        }
      });
  }
  private renderPins(pins: PinMarkerDTO[]): void {
    const visibleMarkerIds = new Set(pins.map(pin => pin.id.toString()));

    for (const [id, marker] of this.markers) {
      if (!visibleMarkerIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }

    for (const pin of pins) {
      const existingMarker = this.markers.get(pin.id.toString());
      const lngLat: [number, number] = [pin.longitude, pin.latitude];

      if (existingMarker) {
        existingMarker.setLngLat(lngLat);
        continue;
      }


      const newMarker = new mapboxgl.Marker({ color: this.getMarkerColor(pin.pinType) })
        .setLngLat(lngLat)
        .addTo(this.map);

      this.markers.set(pin.id.toString(), newMarker);
    }
  }

  private getMarkerColor(pinType: PinType): string {
    switch (pinType) {
      case PinType.CATCHING:
        return '#2ecc71'; // verde
      case PinType.INFORMATION:
        return '#3498db'; // azul
      case PinType.WARNING:
        return '#e74c3c'; // vermelho
      default:
        return '#95a5a6'; // cinza
    }
  }


  //AUTH
  onSignOut(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }

  ngOnDestroy(): void {
    for (const m of this.markers.values()) m.remove();
    this.markers.clear();

    if (this.map) this.map.remove();
  }
}
