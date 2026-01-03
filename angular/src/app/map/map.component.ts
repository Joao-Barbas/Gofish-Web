import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styles: ``
})
export class MapComponent {
  constructor(private router: Router) {}

  onSignOut() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('');
  }
}
