import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { EnumResDto } from '@gofish/shared/dtos/enums.dto';
import { Coords } from '@gofish/shared/models/pin-types';
import { EnumsService } from '@gofish/shared/services/map-services/enums.service';

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

  warnTypeOptions: EnumResDto[] = [];
  selectedWarnType: number | null = null;

  errorMessage = '';

  constructor(private enumsService: EnumsService) { }

  ngOnInit() {
    this.enumsService.getWarnPinTypes().subscribe({
      next: (data) => {
        this.warnTypeOptions = data;
      },
      error: (err) => console.error('Erro ao carregar warntype', err)
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
