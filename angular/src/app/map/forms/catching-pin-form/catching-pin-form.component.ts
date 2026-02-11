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

  body = '';
  visibilityOptions: EnumeratorDTO[] = [];
  selectedVisibilityType!: number;
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
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.visibilityOptions = res.data!.enumerator;
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

    if (this.selectedVisibilityType === null) {
      this.errorMessage = 'Tem de escolher um tipo de visibilidade'
      return;
    }


    const formData = new FormData();

    formData.append('Latitude', this.coords.latitude.toString());
    formData.append('Longitude', this.coords.longitude.toString());
    formData.append('Visibility', this.selectedVisibilityType.toString());
    formData.append('Body', this.body);
    formData.append('Image', this.image);
    if (this.selectedSpeciesType !== null && this.selectedSpeciesType !== undefined) {
      formData.append('SpeciesType', this.selectedSpeciesType.toString());
    }
    if (this.hookSize !== null && this.hookSize !== undefined) {
      formData.append('HookSize', this.hookSize.toString());
    }
    if (this.selectedBaitType !== null && this.selectedBaitType !== undefined) {
      formData.append('BaitType', this.selectedBaitType.toString());
    }

    if (!formData) return;

    this.submitForm.emit(formData);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.image = input.files[0];
  }
}
