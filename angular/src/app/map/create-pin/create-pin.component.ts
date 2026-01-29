import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateCatchingPinDTO } from '@gofish/shared/dtos/create-catching-pin';
import { Coords, PinType } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/pin.service';
import { CatchingPinFormComponent } from '../forms/catching-pin-form/catching-pin-form.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@gofish/shared/services/auth.service';
import { CreateCatchPinReqDTO, CreateInfoPinReqDTO, CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { InfoPinFormComponent } from '../forms/info-pin-form/info-pin-form.component';
import { WarnPinFormComponent } from '../forms/warn-pin-form/warn-pin-form.component';

// Vale a pena fazer um padrao state ?
type Step = 'idle' | 'chooseLocation' | 'chooseType' | 'fillForm';

// Ver se da para colocar noutro sitio
type PinCreatedEvent =
  | { type: PinType.CATCHING; dto: CreateCatchPinReqDTO; res: any }
  | { type: PinType.INFORMATION; dto: CreateInfoPinReqDTO; res: any }
  | { type: PinType.WARNING; dto: CreateInfoPinReqDTO; res: any };

@Component({
  selector: 'app-create-pin',
  imports: [CommonModule, FormsModule, CatchingPinFormComponent, InfoPinFormComponent, WarnPinFormComponent],
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

  constructor(private pinService: PinService,
    private auth: AuthService
  ) { }

  startCreatingPin() {
    if (!this.auth.getToken?.()) {
      alert('You need to be logged in to create a pin.');
      return;
    }
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

  goToChooseType(): void {
    if (!this.selectedCoords) {
      this.errorMessage = 'No location selected';
      return;
    }
    this.errorMessage = '';
    this.step = 'chooseType';
  }

  selectTypeAndContinue(type: PinType): void {
    this.pinType = type;
    this.errorMessage = '';
    this.step = 'fillForm';
  }

  backToChooseLocation(): void {
    this.errorMessage = '';
    this.step = 'chooseLocation';
  }

  backToChooseType(): void {
    this.errorMessage = '';
    this.step = 'chooseType';
  }
  onCatchingSubmit(dto: CreateCatchPinReqDTO) {
    if (this.loading) return;
    this.loading = true;

    this.pinService.createCatchPin(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.creationComplete.emit({ type: PinType.CATCHING, dto, res } as any);
        this.cancelCreatingPin();
      },
      error: (err) => {
        this.loading = false;
        this.creationFailed.emit('Error creating CatchingPin');
      }
    });
  }

  onInfoSubmit(dto: CreateInfoPinReqDTO) {
    if (this.loading) return;
    this.loading = true;

    this.pinService.createInfoPin(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.creationComplete.emit({ type: PinType.INFORMATION, dto, res } as any);
        this.cancelCreatingPin();
      },
      error: (err) => {
        this.loading = false;
        this.creationFailed.emit('Error creating InfoPin');
      }
    });
  }

  onWarnSubmit(dto: CreateWarnPinReqDTO) {
    if (this.loading) return;
    this.loading = true;

    this.pinService.createWarningPin(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.creationComplete.emit({ type: PinType.WARNING, dto, res } as any);
        this.cancelCreatingPin();
      },
      error: (err) => {
        console.error('CreateWarnPin error:');
        this.loading = false;
        this.creationFailed.emit('Error creating WarnPin');
      }
    });
  }
}
