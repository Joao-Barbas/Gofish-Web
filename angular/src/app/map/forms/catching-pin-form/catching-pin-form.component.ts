import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateCatchPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { Coords } from '@gofish/shared/models/pin-types';

@Component({
  selector: 'app-catching-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './catching-pin-form.component.html',
  styleUrls: ['./catching-pin-form.component.css']
})
export class CatchingPinFormComponent {
  @Input() coords: Coords | null = null;
  @Output() submitForm = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();

  description = '';
  speciesType = 0;
  hookSize = 0;
  baitType = 0;
  image: File | null = null;

  errorMessage: string = '';

  onSubmit(): void {
    if (!this.coords) {
      this.errorMessage = "Sem coordenadas";
      return;
    }

    if (!this.image) {
      this.errorMessage = "Sem imagem";
      return;
    }

    const formData = new FormData();

    formData.append('Latitude', this.coords.latitude.toString());
    formData.append('Longitude', this.coords.longitude.toString());
    formData.append('Description', this.description);
    formData.append('Image', this.image);
    formData.append('SpeciesType', this.speciesType.toString());
    formData.append('HookSize', this.hookSize.toString());
    formData.append('BaitType', this.baitType.toString());

    if(!formData) return;

    this.submitForm.emit(formData);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.image = input.files[0];
  }
}
