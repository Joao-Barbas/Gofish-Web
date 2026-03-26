import { Component, inject } from '@angular/core';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { PopupService } from '@gofish/shared/services/popup.service';

@Component({
  selector: 'app-group-settings-popover',
  standalone: true,
  imports: [ClickOutsideDirective],
  templateUrl: './group-settings-popover.component.html',
  styleUrl: './group-settings-popover.component.css',
})
export class GroupSettingsPopoverComponent {
  readonly popupController = new PopupController('group-options');
  readonly popupService = inject(PopupService);

  close() {
    this.popupService.close();
  }
}
