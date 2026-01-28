import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateCatchingPinDTO } from '@gofish/shared/dtos/create-catching-pin';
import { Coords } from '@gofish/shared/models/pin-types';

@Component({
  selector: 'app-catching-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './catching-pin-form.component.html',
  styles: ``
})
export class CatchingPinFormComponent {
@Input() coords!: Coords;
@Output() submitForm = new EventEmitter<CreateCatchingPinDTO>();

description = '';
speciesType = 0;
hookSize = 0;
baitType = 0;

onSubmit() {
    this.submitForm.emit({
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      description: this.description.trim() || 'Sem descrição',
      speciesType: this.speciesType,
      hookSize: this.hookSize,
      baitType: this.baitType,
    });
  }
}
