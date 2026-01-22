import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import mapboxgl from 'mapbox-gl';



@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  public firstName: string = '';
  private map !: mapboxgl.Map; // Map instance
  private marker !: mapboxgl.Marker; // Marker instance


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

        const map = new mapboxgl.Map({
          container: 'map', // container ID
          style: 'mapbox://styles/goncalopro2/cmkpidm7e003601s526nugcv1', // style URL
          center: [-8.8882, 38.5243], // [lng, lat]
          zoom: 13, // starting zoom
          maxZoom: 13,
          minZoom: 4
        });

        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();

        // Add pin manually
        this.marker = new mapboxgl.Marker()
          .setLngLat([-8.8882, 38.5243])
          .addTo(map);

        this.enableClickPin();
  }

  private enableClickPin(): void {
    this.map.on('click', (event) => {
      const { lng, lat } = event.lngLat;

      this.marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(this.map);

        console.log(`Marker placed at Longitude: ${lng}, Latitude: ${lat}`);
    });
  }

  onSignOut() {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }
}

