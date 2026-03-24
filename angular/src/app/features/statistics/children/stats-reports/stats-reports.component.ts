import { Component } from '@angular/core';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";

import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';

import { Species } from '../../../../shared/enums/species.enum';
import { Bait } from '../../../../shared/enums/bait.enums';
import { AccessDifficulty } from '../../../../shared/enums/access-difficulty.enums';
import { Seabed } from '../../../../shared/enums/seabed.enum';
import { WarningKind } from '../../../../shared/enums/warning-kind.enum';

@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  protected readonly Species = Species;
  protected readonly Bait = Bait;
  protected readonly AccessDifficulty = AccessDifficulty;
  protected readonly Seabed = Seabed;
  protected readonly WarningKind = WarningKind;

}
