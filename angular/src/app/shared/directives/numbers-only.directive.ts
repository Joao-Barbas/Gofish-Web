// numbers-only.directive.ts

import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  @HostListener('input', ['$event'])
  onInput(event: any) {
    const initialValue = event.target.value;
    event.target.value = initialValue.replace(/[^0-9]/g, '');
    if (initialValue !== event.target.value) { event.stopPropagation(); }
  }
}
