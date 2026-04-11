import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';

/**
 * Supported interaction modes stored in the map URL.
 */
export type UrlMode = 'geo' | 'picked' | 'pick';

/**
 * Parsed map-related query parameters.
 *
 * Fields:
 * - vLat / vLng: current map viewport center
 * - z: current zoom level
 * - sLat / sLng: currently selected coordinates
 * - mode: current map interaction mode
 */
export interface UrlQuery {
  vLat: number | null; // view
  vLng: number | null; // view
  z: number | null;
  sLat: number | null; // selected
  sLng: number | null;
  mode: UrlMode | null;
}

/**
 * Service responsible for parsing and validating map-related query
 * parameters stored in the URL.
 *
 * Responsibilities:
 * - Parse numeric and mode values from query parameters
 * - Validate viewport and selected coordinates
 * - Validate zoom and interaction mode values
 * - Provide typed access to parsed URL state
 */
@Injectable({
  providedIn: 'root',
})
export class UrlService {
  /** Allowed interaction modes that can appear in the URL. */
  private readonly allowedModes: UrlMode[] = ['geo', 'picked', 'pick'];

  /**
   * Validates whether the URL query parameters represent a consistent
   * and supported map state.
   *
   * Validation rules:
   * - View latitude and longitude must both exist or both be absent
   * - Selected latitude and longitude must both exist or both be absent
   * - Coordinates must be within valid geographic ranges
   * - Zoom must be within supported bounds
   * - Mode must match one of the allowed values
   *
   * @param paramMap Query parameter map to validate
   * @returns True when the query parameters are valid
   */
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

  /**
   * Parses all supported map-related query parameters into a typed object.
   *
   * @param paramMap Query parameter map to parse
   * @returns Parsed URL state
   */
  getUrlValues(paramMap: ParamMap): UrlQuery {
    const vLat = this.parseNumber(paramMap.get('vLat'));
    const vLng = this.parseNumber(paramMap.get('vLng'));
    const z = this.parseNumber(paramMap.get('z'));
    const sLat = this.parseNumber(paramMap.get('sLat'));
    const sLng = this.parseNumber(paramMap.get('sLng'));
    const mode = this.parseMode(paramMap.get('mode'));

    return { vLat, vLng, z, sLat, sLng, mode };
  }

  /**
   * Validates whether a longitude and latitude pair is within
   * the supported geographic range.
   *
   * @param lng Longitude value
   * @param lat Latitude value
   * @returns True when the coordinates are valid
   */
  isLngLatValid(lng: number, lat: number): boolean {
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  }

  /**
   * Reads and parses a numeric query parameter by key.
   *
   * @param paramMap Query parameter map
   * @param key Parameter name
   * @returns Parsed number or null when invalid or missing
   */
  getNumber(paramMap: ParamMap, key: string): number | null {
    const value = paramMap.get(key);

    if (!value) return null;

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  /**
   * Checks whether a string is a supported URL mode.
   *
   * @param value Raw mode string
   * @returns True when the value matches a supported mode
   */
  private isValidMode(value: string): value is UrlMode {
    return this.allowedModes.includes(value as UrlMode);
  }

  /**
   * Parses a numeric string into a number.
   *
   * @param value Raw string value
   * @returns Parsed number or null when empty or invalid
   */
  private parseNumber(value: string | null): number | null {
    if (value === null || value.trim() === '') return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /**
   * Parses a raw mode string into a supported URL mode.
   *
   * @param value Raw mode string
   * @returns Parsed mode or null when invalid or missing
   */
  private parseMode(value: string | null): UrlMode | null {
    if (!value) return null;
    return this.isValidMode(value) ? value : null;
  }
}
