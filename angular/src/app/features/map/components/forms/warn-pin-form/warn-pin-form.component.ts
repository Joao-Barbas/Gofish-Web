import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { PinService } from '@gofish/features/map/services/pin.service';
import { Coords } from '@gofish/shared/models/coords.model';

@Component({
  selector: 'app-warn-pin-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './warn-pin-form.component.html',
  styles: ``
})
export class WarnPinFormComponent {
  @Input() coords!: Coords;
  @Output() submitForm = new EventEmitter<CreateWarnPinReqDTO>();

  body: string = '';

  visibilityOptions: EnumeratorDTO[] = [];
  selectedVisibility?: number | null;

  warnTypeOptions: EnumeratorDTO[] = [];
  selectedWarnType?: number | null ;

  errorMessage = '';

  constructor(private pinService: PinService) { }

  ngOnInit() {
    this.pinService.enumerateWarnType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.warnTypeOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res);
      }
    });
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.visibilityOptions = res.data!.enumerator;
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

    if (this.body.trim().length < 5) {
      this.errorMessage = 'A descrição deve ter no minimo 5 caracteres!'
      return;
    }

    const warnPinData: CreateWarnPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      visibility: this.selectedVisibility as number,
      body: this.body.trim() || null,
      warnPinType: this.selectedWarnType as number
    };

    this.submitForm.emit(warnPinData);
  }
}
