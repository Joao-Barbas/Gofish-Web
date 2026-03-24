import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

import { Species } from '../../enums/species.enum';
import { Bait } from '../../enums/bait.enums';
import { AccessDifficulty } from '../../enums/access-difficulty.enums';
import { Seabed } from '../../enums/seabed.enum';
import { WarningKind } from '../../enums/warning-kind.enum';

export type PinType = 'catch' | 'info' | 'warning';


@Component({
  selector: 'app-gf-card-pin-preview',
  imports: [NgClass],
  templateUrl: './gf-card-pin-preview.component.html',
  styleUrl: './gf-card-pin-preview.component.css',
})
export class GfCardPinPreviewComponent {
  @Input() pinType: PinType = 'catch';
  @Input() isReportedPin: boolean = false;

  @Input() authorProfilePhoto: string = 'assets/images/placeholder_profile_pic.png';
  @Input() authorName: string = '';
  @Input() timeAgo: string = '';
  @Input() votes: number = 0;
  @Input() comments: number = 0;
  @Input() reportNumber?: number;

  // Catch
  @Input() species?: Species;
  @Input() bait?: Bait;
  @Input() hookSize?: string;

  // Info
  @Input() accessDifficulty?: AccessDifficulty;
  @Input() seabed?: Seabed;

  // Warning
  @Input() warningKind?: WarningKind;
}
