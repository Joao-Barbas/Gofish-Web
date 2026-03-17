import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { AuthService } from '@gofish/shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cluster-details',
  imports: [TimeAgoPipe],
  templateUrl: './cluster-details.component.html',
  styleUrl: './cluster-details.component.css',
})
export class ClusterDetailsComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  readonly popupController = new PopupController('cluster-preview');
  pinsData = input<PinDataResDTO[] | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();


  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  deletePin(id: number): void {
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }
}
