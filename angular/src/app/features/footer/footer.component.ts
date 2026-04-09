// footer.component.ts

import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { BUSINEES_ADDRESS, BUSINESS_EMAIL, BUSINESS_PHONE } from '@gofish/shared/constants';

export type FooterVariant = 'big' | 'small' | 'none';

@Component({
  selector: 'gf-footer',
  host: {
    '[class.big]': "variant() === 'big'",
    '[class.small]': "variant() === 'small'",
    '[class.none]': "variant() === 'none'",
  },
  imports: [
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly variant = input.required<FooterVariant>();
  readonly year    = new Date().getFullYear();

  readonly BUSINESS_EMAIL   = BUSINESS_EMAIL;
  readonly BUSINESS_PHONE   = BUSINESS_PHONE;
  readonly BUSINEES_ADDRESS = BUSINEES_ADDRESS;
}
