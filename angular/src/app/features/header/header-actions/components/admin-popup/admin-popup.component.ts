import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { PopupController } from "@gofish/shared/core/popup-controller";
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { SimplePopup } from "@gofish/shared/models/popup.model";

@Component({
  selector: 'app-admin-popup',
  imports: [ CommonModule, ClickOutsideDirective ],
  templateUrl: './admin-popup.component.html',
  styleUrl: './admin-popup.component.css'
})
export class AdminPopupComponent implements SimplePopup {
  readonly popupController = new PopupController('header-admin-popup');
}
