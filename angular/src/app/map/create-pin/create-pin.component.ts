import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateCatchingPinDTO } from '@gofish/shared/dtos/create-catching-pin';
import { Coords, PinType } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/pin.service';
import { CatchingPinFormComponent } from '../forms/catching-pin-form/catching-pin-form.component';
import { FormsModule } from '@angular/forms';

// Vale a pena fazer um padrao state ?
type Step = 'idle' | 'chooseLocation' | 'fillForm';

// Ver se da para colocar noutro sitio
type PinCreatedEvent =
  | { type: PinType.CATCHING; dto: CreateCatchingPinDTO; res: any };

@Component({
  selector: 'app-create-pin',
  imports: [CommonModule, FormsModule, CatchingPinFormComponent],
  templateUrl: './create-pin.component.html',
  styles: ``
})

// Falta colocar os DTOs dos outros pins no shared

export class CreatePinComponent {
  @Input() selectedCoords: Coords | null = null;

  // Pai entra em modo “clicar no mapa”
  @Output() requestPickOnMap = new EventEmitter<void>();

  // Filho pede ao pai para definir coords (GPS)
  @Output() coordsSelected = new EventEmitter<Coords>();

  // Evento final (já com res)
  @Output() creationComplete = new EventEmitter<PinCreatedEvent>();

  @Output() creationFailed = new EventEmitter<string>();

  PinType = PinType;

  pinType: PinType | null = null;
  step: Step = 'idle';
  loading = false;
  errorMessage = '';

  constructor(private pinService: PinService) {}

  startCreatingPin() {
    this.errorMessage = '';
    this.step = 'chooseLocation';
  }

  cancelCreatingPin() {
    this.errorMessage = '';
    this.loading = false;
    this.pinType = null;
    this.step = 'idle';
  }

  chooseCurrentLocation() {
    this.errorMessage = '';

    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation not supported.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // manda ao pai
        this.coordsSelected.emit(coords);

        // já avançar para escolher tipo/form
        this.step = 'fillForm';
      },
      () => {
        this.errorMessage = 'Not possible to get location.';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  chooseOnMap() {
    this.errorMessage = '';
    this.requestPickOnMap.emit();
    // esperar o pai mandar as coords
  }

  continueAfterChoosingLocation(pinType: PinType) {
    if (!this.selectedCoords) {
      this.errorMessage = 'Select a location first.';
      return;
    }
    this.pinType = pinType;
    this.step = 'fillForm';
  }

  onCatchingSubmit(partial: Omit<CreateCatchingPinDTO, 'latitude' | 'longitude'>) {
    if (!this.selectedCoords) {
      this.errorMessage = 'No location.';
      return;
    }
    if (this.loading) return;

    const dto: CreateCatchingPinDTO = {
      latitude: this.selectedCoords.latitude,
      longitude: this.selectedCoords.longitude,
      ...partial,
    };

    this.loading = true;
    this.pinService.createCatchPin(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.creationComplete.emit({ type: PinType.CATCHING, dto, res });
        this.cancelCreatingPin();
      },
      error: (err) => {
        this.loading = false;

        console.error('CreateCatchPin error:', err);

        const msg =
          err?.error?.message ??
          err?.error?.title ??
          err?.message ??
          'Error creating pin.';

        this.errorMessage = msg;
        this.creationFailed.emit(msg);
      },
    });
  }
}
