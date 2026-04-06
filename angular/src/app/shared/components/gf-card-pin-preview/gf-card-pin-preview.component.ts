import { Component, computed, inject, input, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { PinService } from '@gofish/shared/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GetReportResDTO } from '@gofish/shared/dtos/report.dto';
import { UserTitleComponent } from "../user-title/user-title.component";


export type PinType = 'catch' | 'info' | 'warning';

@Component({
  selector: 'app-gf-card-pin-preview',
  imports: [NgClass, TimeAgoPipe, RouterLink, UserTitleComponent],
  templateUrl: './gf-card-pin-preview.component.html',
  styleUrl: './gf-card-pin-preview.component.css',
})
export class GfCardPinPreviewComponent implements OnInit {
  private readonly pinService = inject(PinService);
  readonly avatarService = inject(AvatarService);

  pinData = input.required<PinDto>();
  isReportedPin = input<boolean>(false);
  reportNumber = input<number>();
  reportIndex = input<number>();

  pinKind = PinKind;

  pinLink = computed(
    () => this.isReportedPin() ? `pin/${this.pinData().id}` : `pin/${this.pinData().id}`
  )

  // Enum options
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
