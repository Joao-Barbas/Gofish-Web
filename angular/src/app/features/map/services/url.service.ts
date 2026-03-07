import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';

export type urlMode = 'geo' | 'pick' | 'warn' | 'info' | 'catch';

export interface urlQuery {
  lat: number | null,
  lng: number | null,
  z: number | null,
  mode: urlMode | null,
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private readonly allowedModes: urlMode[] = ['geo', 'pick', 'warn', 'info', 'catch'];

  getUrlValues(paramMap: ParamMap): urlQuery | null {
    const lat = this.parseNumber(paramMap.get('lat'));
    const lng = this.parseNumber(paramMap.get('lng'));
    const z = this.parseNumber(paramMap.get('z'));
    const mode = this.parseMode(paramMap.get('mode'));

    if (lat === null && lng === null ) return null;

    return {
      lat,
      lng,
      z,
      mode,
    };
  }

  private parseNumber(value: string | null): number | null {
    if (value === null || value.trim() === '') return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private parseMode(value: string | null): urlMode | null {
    if (!value) return null;
    return this.allowedModes.includes(value as urlMode)
      ? (value as urlMode)
      : null;
  }

}
