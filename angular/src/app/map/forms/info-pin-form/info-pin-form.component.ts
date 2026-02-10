import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/map-services/pin.service';

@Component({
  selector: 'app-info-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-pin-form.component.html',
  styles: ``
})
export class InfoPinFormComponent {
  @Input() coords!: Coords;
  @Output() submitForm = new EventEmitter<CreateInfoPinReqDTO>();
  @Output() cancel = new EventEmitter<void>();

  description: string = '';
  accessDifficulty: number = 1;

  seaBedOptions: EnumeratorDTO[] = [];
  selectedSeaBed: number | null = null;

  errorMessage: string = '';

  //image: File | null = null;

  constructor(private pinService: PinService) { }

  ngOnInit(): void {
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.seaBedOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.description.trim().length < 5) {
      this.errorMessage = 'A descrição deve ter no minimo 5 caracteres!'
      return;
    }

    if (!this.selectedSeaBed) {
      this.errorMessage = 'Tem que selecionar um seabedtype';
      return;
    }

    this.submitForm.emit({
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      description: this.description.trim() || 'Sem descrição',
      accessDifficulty: this.accessDifficulty,
      seaBedType: this.selectedSeaBed as any
    });
  }

  /* onSubmit(): void {
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
    formData.append('AccessDifficulty', this.accessDifficulty.toString());
    if(this.selectedSeaBed === null) return;
    formData.append('SeaBedType', this.selectedSeaBed.toString());

    if (!formData) return;

    this.submitForm.emit(formData);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.image = input.files[0];
  }
 */

}
