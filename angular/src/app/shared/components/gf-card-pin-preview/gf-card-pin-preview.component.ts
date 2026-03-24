import { Component, inject, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';

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
export class GfCardPinPreviewComponent implements OnInit {
  private readonly pinService = inject(PinService);

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

  // Enum options (vindas do backend)
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];
  accessDifficultyOptions: EnumDTO[] = [];
  seabedOptions: EnumDTO[] = [];
  warningKindOptions: EnumDTO[] = [];

  ngOnInit() {
    this.pinService.enumerateSpeciesType().subscribe({
      next: (res) => this.speciesOptions = res,
      error: (err: HttpErrorResponse) => console.error(err)
    });
    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res,
      error: (err: HttpErrorResponse) => console.error(err)
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res) => this.accessDifficultyOptions = res,
      error: (err: HttpErrorResponse) => console.error(err)
    });
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res) => this.seabedOptions = res,
      error: (err: HttpErrorResponse) => console.error(err)
    });
    this.pinService.enumerateWarnType().subscribe({
      next: (res) => this.warningKindOptions = res,
      error: (err: HttpErrorResponse) => console.error(err)
    });
  }

  getEnumDisplayName(options: EnumDTO[], value: number): string {
    if (value === null) return '';
    const option = options.find(opt => opt.value === value);
    return option ? option.display : '';
  }
}
