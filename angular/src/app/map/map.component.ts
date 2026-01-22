import { Component, OnInit } from '@angular/core';
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
export class MapComponent implements OnInit {




  public firstName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ){}
  ngOnInit(): void {

        (mapboxgl as typeof mapboxgl).accessToken = 'pk.eyJ1IjoiY2F0Y2hzcG90IiwiYSI6ImNtZHltb3kzMjAzamMyanNhb3FzYjZpN20ifQ.Zc0Kd54svxaUO1PDRGm-OQ';
        const map = new mapboxgl.Map({
          container: 'map', // container ID
          style: 'mapbox://styles/mapbox/streets-v12', // style URL
          center: [-74.5, 40], // starting position [lng, lat]
          zoom: 4, // starting zoom
        });



    this.userService.getUserProfile().subscribe({
      next: (res: any) => this.firstName = res.firstName,
      error: (err: any) => console.log("Error while retrieving user profile:\n", err)
    })
  }

  onSignOut() {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }


}
