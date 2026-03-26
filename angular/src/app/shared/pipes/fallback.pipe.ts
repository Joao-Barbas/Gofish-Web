import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fallback'
})
export class FallbackPipe implements PipeTransform {
  transform(value: string | null | undefined, fallback = '-'): string {
    return value?.trim() ? value : fallback;
  }
}
