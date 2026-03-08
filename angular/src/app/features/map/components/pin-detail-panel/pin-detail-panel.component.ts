import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output} from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import {PinDataResDTO} from '@gofish/shared/dtos/pin.dto';

@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  readonly popupController = new PopupController('pin-preview');
  readonly pinData = input<PinDataResDTO | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }
}



