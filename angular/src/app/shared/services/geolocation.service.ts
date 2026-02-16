import { Injectable, signal } from '@angular/core';

export type GeolocationState = PermissionState | 'inaccurate';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private _permissionState = signal<GeolocationState>('prompt');
  private _coords = signal<GeolocationCoordinates | null>(null); // Uau este tipo ja existia

  public readonly permissionState = this._permissionState.asReadonly();
  public readonly coords = this._coords.asReadonly();

  public async checkPermission(): Promise<void> {
    if (!navigator.permissions) {
      this._permissionState.set('prompt');
      return;
    }
    const status = await navigator.permissions.query({
      name: 'geolocation',
    });
    this._permissionState.set(status.state);
    status.onchange = () => this._permissionState.set(status.state); // React to changes automatically
  }

  public requestLocation(): boolean {
    console.info('Requesting location');

    if (!navigator.geolocation) {
      console.warn('This browser does not support geo location');
      this._permissionState.set('denied');
      return false;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.accuracy > 500) {
          this._permissionState.set('inaccurate'); // Location too inaccurate
        } else {
          this._permissionState.set('granted');
          this._coords.set(position.coords);
        }
      },
      (error) => {
        console.error('Unable to acquire geo location: ', error);
        this._permissionState.set('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return true;
  }

  // Here we can extend to get ip geolocation too
}
