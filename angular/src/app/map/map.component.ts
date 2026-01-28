import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import mapboxgl from 'mapbox-gl';

import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { PinService } from '@gofish/shared/services/pin.service';
import { CreateCatchPinReqDTO, CreateCatchPinResDTO } from '@gofish/shared/dtos/create-pin.dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  firstName = '';

  private map!: mapboxgl.Map;

  // ponto selecionado
  selected: { lng: number; lat: number } | null = null;

  // preview do marker
  private previewMarker: mapboxgl.Marker | null = null;

  // DtO fields
  description = '';
  speciesType = 0;
  hookSize = 0;
  baitType = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private pinService: PinService
  ) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => (this.firstName = res.firstName),
      error: (err: any) => console.log('Error while retrieving user profile:\n', err)
    });
  }

  ngAfterViewInit(): void {
    // TOKEN GONCALO
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
      bearing: 0
    });

    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();

    // Esperar o mapa carregar
    this.map.on('load', () => {
      this.map.on('click', (e) => this.onMapClick(e));
    });
  }

  onMapClick(e: mapboxgl.MapMouseEvent): void {
    const { lng, lat } = e.lngLat;

    this.selected = { lng, lat };
    console.log('COORDENADAS:', lng, lat);

    // marker preview
    if (this.previewMarker) this.previewMarker.remove();
    this.previewMarker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  addPin(): void {
    if (!this.selected) return;

    const dto: CreateCatchPinReqDTO = {
      latitude: this.selected.lat,
      longitude: this.selected.lng,
      description: this.description.trim() || 'Sem descrição',
      speciesType: this.speciesType,
      hookSize: this.hookSize,
      baitType: this.baitType
    };

    console.log('DTO a enviar:', dto);

    this.pinService.createCatchPin(dto).subscribe({
      next: (res: CreateCatchPinResDTO) => {
        // marker definitivo (dá para trocar o icon depois)
        new mapboxgl.Marker()
          .setLngLat([dto.longitude, dto.latitude])
          .addTo(this.map);

        // limpar seleção/preview
        if (this.previewMarker) {
          this.previewMarker.remove();
          this.previewMarker = null;
        }
        this.selected = null;

        // opcional: reset ao form
        this.description = '';
        // this.speciesType = 0;
        // this.hookSize = 0;
        // this.baitType = 0;

        console.log('Pin criado:', res);
      },
      error: (err: HttpErrorResponse) => {

        var res = err.error as CreateCatchPinResDTO;

        console.log(res);

      }
    });
  }

  onSignOut(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
