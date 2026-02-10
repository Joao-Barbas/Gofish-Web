import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/pin-types';
import { PinService } from '@gofish/shared/services/map-services/pin.service';

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

  warnTypeOptions: EnumeratorDTO[] = [];
  selectedWarnType: number | null = null;

  errorMessage = '';

  constructor(private pinService: PinService) { }

  ngOnInit() {
    this.pinService.enumerateWarningType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.warnTypeOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if(!this.selectedWarnType) {
      this.errorMessage = 'Tem que selecionar um tipo de aviso!'
      return;
    }

    if (this.description.trim().length < 5) {
      this.errorMessage = 'A descrição deve ter no minimo 5 caracteres!'
      return;
    }

    const warnPinData: CreateWarnPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      description: this.description.trim() || 'Sem descrição',
      warnPinType: this.selectedWarnType as any
    };

    this.submitForm.emit(warnPinData);
  }
}
