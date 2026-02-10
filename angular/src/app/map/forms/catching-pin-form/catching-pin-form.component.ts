import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnumResDto } from '@gofish/shared/dtos/enums.dto';
import { Coords } from '@gofish/shared/models/pin-types';
import { EnumsService } from '@gofish/shared/services/map-services/enums.service';

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

  speciesTypeOptions: EnumResDto[] = [];
  selectedSpeciesType: number | null = null;

  hookSize = 0;

  baitTypeOptions: EnumResDto[] = [];
  selectedBaitType: number | null = null;

  image: File | null = null;

  errorMessage: string = '';

  constructor(private enumService: EnumsService) { }

  ngOnInit(): void {
    this.enumService.getBaitTypes().subscribe({
      next: (data) => {
        this.baitTypeOptions = data;
      },
      error: (err) => console.error('Erro ao carregar baittypes', err)
    });

    this.enumService.getSpeciesTypes().subscribe({
      next: (data) => {
        this.speciesTypeOptions = data;
      },
      error: (err) => console.error('Erro ao carregar speciestype', err)
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

    if (this.description.length < length) {
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
