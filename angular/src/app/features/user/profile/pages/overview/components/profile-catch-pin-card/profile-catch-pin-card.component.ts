// profile-catch-pin-card.component.ts

import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { Bait, BaitLabel } from '@gofish/shared/enums/bait.enums';
import { Species, SpeciesLabel } from '@gofish/shared/enums/species.enum';
import { FallbackPipe } from "@gofish/shared/pipes/fallback.pipe";
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'gf-profile-catch-pin-card',
  host: {
    '(click)': 'router.navigate([`/forum/post/${pin().id}`])'
  },
  imports: [
    FallbackPipe
  ],
  templateUrl: './profile-catch-pin-card.component.html',
  styleUrl: './profile-catch-pin-card.component.css',
})
export class ProfileCatchPinCardComponent {
  readonly router = inject(Router);
  readonly avatarService = inject(AvatarService);

  pin = input.required<PinDto>();

  Bait = Bait;
  Species = Species;
  SpeciesLabel = SpeciesLabel;
  BaitLabel = BaitLabel;
}
