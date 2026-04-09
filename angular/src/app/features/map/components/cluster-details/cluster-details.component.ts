import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { GeoLocationDTO, PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PinDetailPanelComponent } from '@gofish/features/map/components/pin-detail-panel/pin-detail-panel.component';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";

@Component({
  selector: 'app-cluster-details',
  imports: [PinDetailPanelComponent, ClickOutsideDirective],
  templateUrl: './cluster-details.component.html',
  styleUrl: './cluster-details.component.css',
})
export class ClusterDetailsComponent {
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  readonly popupController = new PopupController('cluster-preview');
  pinsData = input<PinDto[] | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  ngOnInit() {
  }

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
  }
}
