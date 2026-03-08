// no-numbers.directive.ts

import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appLettersOnly]'
})
export class LettersOnlyDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key.length > 1) return;
    if (!/\p{L}/u.test(e.key)) {
      e.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') || '';
    if (!/^\p{L}+$/u.test(text)) {
      e.preventDefault();
    }
  }
}
