import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { CreatePinComponent } from './create-pin/create-pin.component';
import { Coords } from '@gofish/shared/models/pin-types';

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

  // coords selecionadas (formato do teu Coords: latitude/longitude)
  selected: Coords | null = null;

  // preview marker
  private previewMarker: mapboxgl.Marker | null = null;

  // só aceitar cliques no mapa quando estiver a escolher localização
  pickingOnMap = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

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

  //AUTH
  onSignOut(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
