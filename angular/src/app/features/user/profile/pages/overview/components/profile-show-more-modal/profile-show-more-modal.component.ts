// profile-show-more-modal.component.ts

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { UserProfileDTO } from '@gofish/shared/dtos/user-profile.dto';
import { ModalKey, SimpleModal } from '@gofish/shared/models/modal.model';

@Component({
  selector: 'gf-profile-show-more-modal',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)':"controller.close()"
  },
  imports: [
    CommonModule
  ],
  templateUrl: './profile-show-more-modal.component.html',
  styleUrl: './profile-show-more-modal.component.css',
})
export class ProfileShowMoreModalComponent implements SimpleModal {
  static readonly Key: ModalKey = 'gf-profile-show-more-modal';
  readonly controller = new ModalController(ProfileShowMoreModalComponent.Key);
  userProfile = input.required<UserProfileDTO>();
  onPositive(): void { this.controller.close(); }
  onNegative(): void { this.controller.close(); }
}
