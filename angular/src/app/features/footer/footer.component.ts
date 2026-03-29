import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";

export type FooterVariant = 'big' | 'small' | 'none';

@Component({
  selector: 'app-footer', /* gf-footer */
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
}
