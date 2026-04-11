import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { GeoLocationDTO, PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PinDetailPanelComponent } from '@gofish/features/map/components/pin-detail-panel/pin-detail-panel.component';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";

/**
 * Displays the details of pins contained within a map cluster.
 *
 * Responsibilities:
 * - Expose clustered pin data to the template
 * - Allow the user to close the cluster details panel
 * - Emit selected pin coordinates for preview navigation
 */
@Component({
  selector: 'app-cluster-details',
  imports: [PinDetailPanelComponent, ClickOutsideDirective],
  templateUrl: './cluster-details.component.html',
  styleUrl: './cluster-details.component.css',
})
export class ClusterDetailsComponent {
  private readonly authService = inject(AuthService);

  /** Username of the currently authenticated user. */
  userName = this.authService.getUserName();

  /** Controller used to manage the cluster preview popup state. */
  readonly popupController = new PopupController('cluster-preview');

  /** List of pins contained in the selected cluster. */
  pinsData = input<PinDto[] | null>(null);

  /** Pin kind enum exposed to the template. */
  public pinKind = PinKind;

  /** Event emitted when the cluster details panel is closed. */
  @Output() cancel = new EventEmitter<void>();

  /** Event emitted when the user selects coordinates to preview. */
  @Output() coords = new EventEmitter<GeoLocationDTO>();


  /**
   * Closes the cluster details panel and notifies the parent component.
   */
  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  /**
   * Emits the selected coordinates and closes the preview popup.
   *
   * @param coords Coordinates associated with the selected pin
   */
  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
  }
}
