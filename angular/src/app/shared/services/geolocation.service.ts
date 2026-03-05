import { Injectable, computed, signal } from '@angular/core';

export type GeolocationError           = 'inaccurate' | 'unavailable';
export type GeolocationPermissionState = PermissionState;
export type GeolocationState           = GeolocationPermissionState | GeolocationError;

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private _coords = signal<GeolocationCoordinates | null>(null);
  private _state  = signal<GeolocationState>('prompt');

  public readonly isPrompt    = computed(() => this._state() === 'prompt');
  public readonly isAvailable = computed(() => this._state() === 'granted');
  public readonly isError     = computed(() => this._state() === 'inaccurate' || this._state() === 'unavailable');
  public readonly isDenied    = computed(() => this._state() === 'denied');
  public readonly isBad       = computed(() => this.isError() || this.isDenied());

  public readonly state  = this._state.asReadonly();
  public readonly coords = this._coords.asReadonly();

  public async checkPermission(): Promise<GeolocationState> {
    if (!navigator.permissions) return 'prompt';
    var status = await navigator.permissions.query({ name: 'geolocation' });
    this._state.set(status.state);
    status.onchange = () => this._state.set(status.state); // User's can revoke in browser settings and stuff like that
    return status.state;
  }

  public async requestGeolocation(): Promise<boolean> {
    console.info('Requesting location');
    if (!navigator.geolocation) {
      this._state.set('denied');
      console.warn('This browser does not support geo location');
      return false;
    }
    var currentState = await this.checkPermission();
    console.log('currentState: ' + currentState);
    if (currentState === 'denied') {
      console.warn('Location permission previously denied'); // Already denied, don't bother requesting
      return false;
    }
    return new Promise((resolve) => navigator.geolocation.getCurrentPosition(
      (position) => {
        this._state.set(position.coords.accuracy > 2000 ? 'inaccurate' : 'granted'); // TODO: Remove magic number (meters)
        this._coords.set(position.coords);
        resolve(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        this._state.set('denied');
        resolve(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      })
    );
  }

  // Here we can extend to get ip geolocation too
}
