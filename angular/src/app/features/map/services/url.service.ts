import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';

export type UrlMode = 'geo' | 'pick' | 'warn' | 'info' | 'catch';

export interface UrlQuery {
  lat: number | null;
  lng: number | null;
  z: number | null;
  mode: UrlMode | null;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private readonly allowedModes: UrlMode[] = ['geo', 'pick', 'warn', 'info', 'catch'];

  isUrlValuesValid(paramMap: ParamMap): boolean {
    const values = this.getUrlValues(paramMap);
    if (!values) return false;

    if (!this.isLngLatValid(Number(values.lng), Number(values.lat))) return false;

    if (values.z !== null && (values.z < 0 || values.z > 22)) return false;

    const rawMode = paramMap.get('mode');
    if (rawMode !== null && !this.isValidMode(rawMode)) return false;

    return true;
  }

  getUrlValues(paramMap: ParamMap): UrlQuery | null {
    const lat = this.parseNumber(paramMap.get('lat'));
    const lng = this.parseNumber(paramMap.get('lng'));
    const z = this.parseNumber(paramMap.get('z'));
    const mode = this.parseMode(paramMap.get('mode'));

    if (lat === null || lng === null) return null;

    return {
      lat,
      lng,
      z,
      mode,
    };
  }

  public isLngLatValid(lng: number, lat: number): boolean {
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  }

  private isValidMode(value: string): value is UrlMode {
    return this.allowedModes.includes(value as UrlMode);
  }

  private parseNumber(value: string | null): number | null {
    if (value === null || value.trim() === '') return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private parseMode(value: string | null): UrlMode | null {
    if (value === null || value.trim() === '') return null;

    return this.isValidMode(value) ? value : null;
  }
}
