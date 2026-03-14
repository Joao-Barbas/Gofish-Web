import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';

export type UrlMode = 'geo' | 'picked' | 'pick';

export interface UrlQuery {
  vLat: number | null; // view
  vLng: number | null; // view
  z: number | null;
  sLat: number | null;  // selected
  sLng: number | null;
  mode: UrlMode | null;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private readonly allowedModes: UrlMode[] = ['geo', 'picked', 'pick'];

  isUrlValuesValid(paramMap: ParamMap): boolean {
    const values = this.getUrlValues(paramMap);

    const hasViewLat = values.vLat !== null;
    const hasViewLng = values.vLng !== null;

    const hasSelectedLat = values.sLat !== null;
    const hasSelectedLng = values.sLng !== null;

    // só entra mesta condicao se um for true e outro false(com se fosse uma balanca)
    if (hasViewLat !== hasViewLng) return false;
    if (hasSelectedLat !== hasSelectedLng) return false;

    if (hasViewLat && hasViewLng) {
      if (!this.isLngLatValid(values.vLng!, values.vLat!)) return false;
    }

    if (hasSelectedLat && hasSelectedLng) {
      if (!this.isLngLatValid(values.sLng!, values.sLat!)) return false;
    }

    if (values.z !== null && (values.z < 0 || values.z > 22)) return false;

    const rawMode = paramMap.get('mode');
    if (rawMode !== null && !this.isValidMode(rawMode)) return false;

    return true;
  }

  getUrlValues(paramMap: ParamMap): UrlQuery {
    const vLat = this.parseNumber(paramMap.get('vLat'));
    const vLng = this.parseNumber(paramMap.get('vLng'));
    const z = this.parseNumber(paramMap.get('z'));
    const sLat = this.parseNumber(paramMap.get('sLat'));
    const sLng = this.parseNumber(paramMap.get('sLng'));
    const mode = this.parseMode(paramMap.get('mode'));

    return { vLat, vLng, z, sLat, sLng, mode };
  }

  isLngLatValid(lng: number, lat: number): boolean {
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  }

  getNumber(paramMap: ParamMap, key: string): number | null {
    const value = paramMap.get(key);

    if (!value) return null;

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
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
    if (!value) return null;
    return this.isValidMode(value) ? value : null;
  }
}
