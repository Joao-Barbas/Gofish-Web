import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO} from '@gofish/shared/dtos/enum.dto';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';

@Component({
  selector: 'app-info-pin-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-pin-modal.component.html',
  styleUrl: './info-pin-modal.component.css',
})
export class InfoPinModalComponent implements OnInit {
  @Input() coords: Coords | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  body: string = '';

  visibilityOptions: EnumDTO[] = [];
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];

  selectedVisibility: number = 0;
  selectedAccessDifficulty: number = 0;
  selectedSeaBed: number = 0;

  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private pinService: PinService) { }

  ngOnInit(): void {
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: EnumDTO[]) => {
        this.seaBedOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res: EnumDTO[]) => {
        this.accessDifficultyOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onPublish(): void {
    this.errorMessage = '';

    if (!this.coords) {
      this.errorMessage = 'No coords';
      return;
    }

    if (this.selectedAccessDifficulty === null) {
      this.errorMessage = 'Please select an access difficulty.';
      return;
    }

    if (this.selectedSeaBed === null) {
      this.errorMessage = 'Please select a sea bed type.';
      return;
    }

    const dto: CreateInfoPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      visibility: this.selectedVisibility,
      body: this.body.trim() || null,
      accessDifficulty: this.selectedAccessDifficulty,
      seaBedType: this.selectedSeaBed
    };
    console.log('Creating Info Pin with data:', dto);
    this.isSubmitting = true;

    this.pinService.createInfoPin(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res) {
          this.confirmed.emit();
        } else {
          this.errorMessage = 'Failed to create info pin.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create pin. Please try again.';
      }
    });
  }

}
