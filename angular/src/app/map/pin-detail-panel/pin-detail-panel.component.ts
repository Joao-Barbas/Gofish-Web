import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PinDetailService } from '@gofish/shared/services/map-services/pin-detail.service';


@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule,AsyncPipe],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  selectedPin$ = this.pinDetailService.selectedPin$;

  constructor(private pinDetailService: PinDetailService) { }

ngOnInit(): void { }

closePanel(): void {
  this.pinDetailService.close();
}

}
