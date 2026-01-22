import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import mapboxgl from 'mapbox-gl';




@Component({
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  firstName: string = '';
  private map !: mapboxgl.Map; // Map instance

  selected: { lng: number; lat: number } | null = null; // Selected point
  private previewMarker: mapboxgl.Marker | null = null; // Preview marker instance
  private pins : mapboxgl.Marker[] = []; // Array to hold pin markers


  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => this.firstName = res.firstName,
      error: (err: any) => console.log("Error while retrieving user profile:\n", err)
    })
  }

  ngAfterViewInit(): void {

    mapboxgl.accessToken = 'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

         this.map = new mapboxgl.Map({
          container: 'map', // container ID
          style: 'mapbox://styles/goncalopro2/cmkpidm7e003601s526nugcv1', // style URL
          center: [-8.8882, 38.5243], // [lng, lat]
          zoom: 13, // starting zoom
          maxZoom: 13,
          minZoom: 4
        });

        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disableRotation();
        this.map.keyboard.disableRotation();

        this.map.on('click', (e) => {
          this.onMapClick(e);
        });
  }

  onMapClick(e: mapboxgl.MapMouseEvent): void {
  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  this.selected = { lng, lat };

  console.log('COORDENADAS:', lng, lat);
  }


  addPin(): void {
    if (!this.selected) return;

    const { lng, lat } = this.selected;

    // cria pin definitivo
    const pin = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(this.map);

    this.pins.push(pin);

    // limpa seleção/preview
    if (this.previewMarker) {
      this.previewMarker.remove();
      this.previewMarker = null;
    }
    this.selected = null;
  }



  onSignOut() {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }
}

