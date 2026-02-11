import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/map-services/pin.service';

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

  speciesTypeOptions: EnumeratorDTO[] = [];
  selectedSpeciesType: number | null = null;

  hookSize = 0;

  baitTypeOptions: EnumeratorDTO[] = [];
  selectedBaitType: number | null = null;

  image: File | null = null;

  errorMessage: string = '';

  constructor(private pinService: PinService) { }

  ngOnInit(): void {
    this.pinService.enumerateBaitType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.baitTypeOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res);
      }
    });
    this.pinService.enumerateSpeciesType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.speciesTypeOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res)
      }
    });
  }

  onSubmit(): void {
    if (!this.coords) {
      this.errorMessage = "Sem coordenadas";
      return;
    }

    if (!this.image) {
      this.errorMessage = "Sem imagem";
      return;
    }

    if (this.description.length < 5) {
      this.errorMessage = "A descrição tem de ter mais de 5 caracteres"
      return;
    }

    if (this.selectedSpeciesType === null) {
      this.errorMessage = 'Tem que selecionar o tipo da especie';
      return;
    }

    if (this.selectedBaitType === null) {
      this.errorMessage = 'Tem que selecionar o tipo de isco utilizado';
      return;
    }

    if (this.hookSize <= 0) {
      this.errorMessage = 'Tamanho do anzol inválido, selecione um válido'
      return;
    }


    const formData = new FormData();

    formData.append('Latitude', this.coords.latitude.toString());
    formData.append('Longitude', this.coords.longitude.toString());
    formData.append('Description', this.description);
    formData.append('Image', this.image);
    formData.append('SpeciesType', this.selectedSpeciesType.toString());
    formData.append('HookSize', this.hookSize.toString());
    formData.append('BaitType', this.selectedBaitType.toString());

    if (!formData) return;

    this.submitForm.emit(formData);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.image = input.files[0];
  }
}
