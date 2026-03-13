import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  userName = String(this.authService.userName);
  readonly popupController = new PopupController('pin-preview');
  readonly pinData = input<PinDataResDTO | null>(null);
  readonly pinClusterData = input<PinDataResDTO | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  deletePin(): void {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }
}



