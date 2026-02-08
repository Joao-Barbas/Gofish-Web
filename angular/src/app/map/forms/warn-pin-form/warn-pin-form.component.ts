import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { Coords } from '@gofish/shared/models/pin-types';

@Component({
  selector: 'app-warn-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './warn-pin-form.component.html',
  styles: ``
})
export class WarnPinFormComponent {
@Input() coords!: Coords;
@Output() submitForm = new EventEmitter<CreateWarnPinReqDTO>();

description: string = '';
warnPinType: number = 0;

onSubmit() {
  const warnPinData: CreateWarnPinReqDTO = {
    latitude: this.coords.latitude,
    longitude: this.coords.longitude,
    description: this.description.trim() || 'Sem descrição',
    warnPinType: this.warnPinType,
    };

  this.submitForm.emit(warnPinData);
  }
}
