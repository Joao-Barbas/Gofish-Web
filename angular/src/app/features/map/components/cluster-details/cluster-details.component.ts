import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { GeoLocationDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { AuthService } from '@gofish/shared/services/auth.service';
import { Router } from '@angular/router';
import { Coords } from '@gofish/shared/models/coords.model';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-cluster-details',
  imports: [TimeAgoPipe, JsonPipe],
  templateUrl: './cluster-details.component.html',
  styleUrl: './cluster-details.component.css',
})
export class ClusterDetailsComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  readonly popupController = new PopupController('cluster-preview');
  pinsData = input<PinDataResDTO[] | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  visibilityOptions: EnumDTO[] = [];
  // WARN
  warnTypeOptions: EnumDTO[] = [];
  // INFO
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];
  // CATCH
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];

  ngOnInit() {
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    // Warn
    this.pinService.enumerateWarnType().subscribe({
      next: (res: EnumDTO[]) => {
        this.warnTypeOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });

    // INFO
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: EnumDTO[]) => {
        this.seaBedOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res: EnumDTO[]) => {
        this.accessDifficultyOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    // CATCH
    this.pinService.enumerateSpeciesType().subscribe({
      next: (res: EnumDTO[]) => this.speciesOptions = res
    });

    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res
    });
  }

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  deletePin(id: number): void {
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }

  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
  }

  getEnumLabel(options: EnumDTO[], value: number): string {
    if (value === null) return 'error1';

    const option = options.find(opt => opt.value === value);
    return option ? option.label : 'error2';
  }
}
