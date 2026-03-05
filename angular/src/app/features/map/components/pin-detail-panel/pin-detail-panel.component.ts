import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, OnInit, signal } from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { Coords } from '@gofish/shared/models/coords.model';
import { InvokeFunctionExpr } from '@angular/compiler';
import { AuthorDTO, GeoLocationDTO, PinDataResDTO, PostDTO } from '@gofish/shared/dtos/pin.dto';
import { isNotFound } from '@angular/core/primitives/di';

@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, AsyncPipe, TimeAgoPipe],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  readonly popupController = new PopupController('pin-preview');
  readonly pinData = input<PinDataResDTO | null>(null);
  pinKind = PinKind;



  closePanel(): void {
    this.popupController.close;
  }
}



