import { Component, inject } from '@angular/core';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { NavigationEnd, Router, /*RouterLink, */ RouterLinkActive, RouterOutlet } from "@angular/router";


import { Species } from '../../../../shared/enums/species.enum';
import { Bait } from '../../../../shared/enums/bait.enums';
import { AccessDifficulty } from '../../../../shared/enums/access-difficulty.enums';
import { Seabed } from '../../../../shared/enums/seabed.enum';
import { WarningKind } from '../../../../shared/enums/warning-kind.enum';
import { PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { StatsService } from '@gofish/shared/services/stats.service';
import { GetReportsWaitingReviewResDTO } from '@gofish/shared/dtos/stats.dto';

@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent, /*RouterLink*/],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  protected readonly Species = Species;
  protected readonly Bait = Bait;
  protected readonly AccessDifficulty = AccessDifficulty;
  protected readonly Seabed = Seabed;
  protected readonly WarningKind = WarningKind;
  private readonly statsService = inject(StatsService);

  ngOnInit() {

  }

}

