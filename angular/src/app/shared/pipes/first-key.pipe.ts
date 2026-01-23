import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstKey'
})
@Injectable({
  providedIn: 'root'
})
export class FirstKeyPipe implements PipeTransform {
  transform(value: any): string | null {
    var keys = value ? Object.keys(value) : null;
    if (keys && keys.length > 0) return keys[0];
    return null;
  }
}
