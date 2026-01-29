import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { Coords } from '@gofish/shared/models/pin-types';

@Component({
  selector: 'app-info-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-pin-form.component.html',
  styles: ``
})

export class InfoPinFormComponent {
@Input() coords!: Coords;
@Output() submitForm = new EventEmitter<CreateInfoPinReqDTO>();

description: string = '';
accessDifficulty: number = 1;
seaBedType: number = 0;

onSubmit() {
  this.submitForm.emit({
    latitude: this.coords.latitude,
    longitude: this.coords.longitude,
    description: this.description.trim()|| 'Sem descrição',
    accessDifficulty: this.accessDifficulty,
    seaBedType: this.seaBedType
    });
  }
}
