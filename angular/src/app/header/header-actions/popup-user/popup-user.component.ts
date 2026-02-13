import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PopupComponent, PopupId } from '@gofish/shared/interfaces/popup.interface';
import { PopupService } from '@gofish/shared/services/popup.service';

@Component({
  selector: 'app-popup-user',
  imports: [ CommonModule ],
  templateUrl: './popup-user.component.html',
  styleUrl: './popup-user.component.css'
})
export class PopupUserComponent implements PopupComponent {
  private popupService = inject(PopupService);

  public id: PopupId = "header-user";
  public isOpen$ = this.popupService.isOpen$(this.id);

  toggle() { this.popupService.toggle(this.id); }
  open() { this.popupService.open(this.id); }
  close() { this.popupService.close(); }

  signOut() {
    // this.authService.signOut();
    this.close();
  }

  signIn() {
    this.close()
  }
}
