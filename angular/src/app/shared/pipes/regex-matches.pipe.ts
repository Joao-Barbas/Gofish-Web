/* regex-matches.pipe.ts */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'regexMatches' })
export class RegexMatchesPipe implements PipeTransform {
  transform(value: string | null | undefined, pattern: string): unknown {
    return new RegExp(pattern).test(value || '');
  }
}
