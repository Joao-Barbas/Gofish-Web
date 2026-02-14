import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BasePopupComponent, PopupComponent, PopupKey } from '@gofish/shared/models/popup.model';
import { PopupService } from '@gofish/shared/services/popup.service';

@Component({
  selector: 'app-popup-admin',
  imports: [ CommonModule ],
  templateUrl: './popup-admin.component.html',
  styleUrl: './popup-admin.component.css'
})
export class PopupAdminComponent extends BasePopupComponent {
  public static readonly key: PopupKey = 'popup-header-admin';
}
