import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PinType } from '@gofish/shared/models/pin-types';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinDetailService } from '@gofish/shared/services/map-services/pin-detail.service';


@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule,AsyncPipe, TimeAgoPipe],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  selectedPin$ = this.pinDetailService.selectedPin$;
  public pinType = PinType;

  constructor(private pinDetailService: PinDetailService,
  ) { }

ngOnInit(): void { }

closePanel(): void {
  this.pinDetailService.close();
}

}
