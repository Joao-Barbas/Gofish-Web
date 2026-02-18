import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumeratorDTO, GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';

@Component({
  selector: 'app-info-pin-modal',
  imports: [],
  templateUrl: './info-pin-modal.component.html',
  styleUrl: './info-pin-modal.component.css',
})
export class InfoPinModalComponent {
  @Input() coords!: Coords;
  @Output() submitForm = new EventEmitter<CreateInfoPinReqDTO>();
  @Output() cancel = new EventEmitter<void>();

  body: string = '';

  visibilityOptions: EnumeratorDTO[] = [];
  accessDifficultyOptions: EnumeratorDTO[] = [];
  seaBedOptions: EnumeratorDTO[] = [];
  selectedVisibility: number | null = null;
  selectedAccessDifficulty: number | null = null;
  selectedSeaBed: number | null = null;

  errorMessage: string = '';

  constructor(private pinService: PinService) { }

  ngOnInit(): void {
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.seaBedOptions = res.data!.enumerator;
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as GetEnumeratorResDTO;
        console.error(res);
      }
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res: GetEnumeratorResDTO) => {
        this.accessDifficultyOptions = res.data!.enumerator;
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

    if (this.body.trim().length < 5) {
      this.errorMessage = 'A descrição deve ter no minimo 5 caracteres!'
      return;
    }

    if (!this.selectedSeaBed) {
      this.errorMessage = 'Tem que selecionar um seabedtype';
      return;
    }

    this.submitForm.emit({
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      visibility: this.selectedVisibility as number,
      body: this.body.trim() || null,
      accessDifficulty: this.selectedAccessDifficulty as number,
      seaBedType: this.selectedSeaBed as number
    });
  }
}
