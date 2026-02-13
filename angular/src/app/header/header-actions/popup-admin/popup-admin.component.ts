import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PopupComponent, PopupId } from '@gofish/shared/interfaces/popup.interface';
import { PopupService } from '@gofish/shared/services/popup.service';

@Component({
  selector: 'app-popup-admin',
  imports: [ CommonModule ],
  templateUrl: './popup-admin.component.html',
  styleUrl: './popup-admin.component.css'
})
export class PopupAdminComponent implements PopupComponent {
  private popupService = inject(PopupService);

  public id: PopupId = "header-admin";
  public isOpen$ = this.popupService.isOpen$(this.id);

  toggle() { this.popupService.toggle(this.id); }
  open() { this.popupService.open(this.id); }
  close() { this.popupService.close(); }
}
