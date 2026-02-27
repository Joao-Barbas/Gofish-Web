import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO, EnumeratorDTO, GetEnumeratorResDTO, GetEnumResDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';

@Component({
  selector: 'app-warn-pin-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './warn-pin-modal.component.html',
  styleUrl: './warn-pin-modal.component.css',
})
export class WarnPinModalComponent {
  @Input() coords: Coords | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  body: string = '';

  warnTypeOptions: EnumDTO[] = [];
  visibilityOptions: EnumDTO[] = [];

  selectedVisibility?: number = 0;
  selectedWarnType?: number = 0;

  errorMessage = '';
  isSubmitting: boolean = false;

  constructor(private pinService: PinService) { }

  ngOnInit(): void {
    this.pinService.enumerateWarnType().subscribe({
      next: (res: EnumDTO[]) => {
        this.warnTypeOptions = res;
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

    const dto: CreateWarnPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      visibility: this.selectedVisibility as number,
      body: this.body.trim() || null,
      warnPinType: this.selectedWarnType as number
    };
    console.log('Creating Warn Pin with data:', dto);
    this.isSubmitting = true;

    this.pinService.createWarnPin(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.confirmed.emit();
        } else {
          this.errorMessage = res.errors?.[0]?.description ?? 'Something went wrong.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create pin. Please try again.';
      }
    });
  }


}
