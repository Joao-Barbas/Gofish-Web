import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewPinType } from '@gofish/features/map/map.component';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/coords.model';

@Component({
  selector: 'app-catch-pin-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './catch-pin-modal.component.html',
  styleUrl: './catch-pin-modal.component.css'
})
export class CatchPinModalComponent {
  @Input() coords: Coords | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();


  constructor(private pinService: PinService) { }
  visibilityOptions: EnumeratorDTO[] = [];
  speciesOptions: EnumeratorDTO[] = [];
  baitOptions: EnumeratorDTO[] = [];

  selectedVisibility!: number;
  selectedSpecies: number | null = null;
  selectedBait: number | null = null;
  hookSize: string = '';
  body: string = '';
  image: File | null = null;

  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res) => {
        this.visibilityOptions = res.data?.enumerator ?? [];
        this.selectedVisibility = this.visibilityOptions[0]?.value;
      }
    });

    this.pinService.enumerateSpeciesType().subscribe({
      next: (res) => this.speciesOptions = res.data?.enumerator ?? []
    });

    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res.data?.enumerator ?? []
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.image = input.files[0];
    }
  }


  onCancel(): void {
    this.cancelled.emit();
  }

  onPublish(): void {
    this.errorMessage = null;

    if (!this.coords) {
      this.errorMessage = 'No coords';
      return;
    }

    if (!this.image) {
      this.errorMessage = 'Please upload an image.';
      return;
    }

    const formData = new FormData();
    formData.append('Latitude', this.coords.latitude.toString());
    formData.append('Longitude', this.coords.longitude.toString());
    formData.append('Visibility', this.selectedVisibility.toString());
    formData.append('Image', this.image);

    if (this.body) formData.append('Body', this.body);
    if (this.selectedSpecies) formData.append('SpeciesType', this.selectedSpecies.toString());
    if (this.hookSize) formData.append('HookSize', this.hookSize);
    if (this.selectedBait) formData.append('BaitType', this.selectedBait.toString());

    this.isSubmitting = true;

    this.pinService.createCatchPin(formData).subscribe({
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
