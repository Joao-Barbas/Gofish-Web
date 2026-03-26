import { Component, inject } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';

@Component({
  selector: 'gf-profile-actions-popover',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)':"popupController.close()"
  },
  imports: [

  ],
  template: `
    @if (profileContext.isFriend()) {
      <button (click)="onUnfriend()">Unfriend</button>
    }
  `,
  styles: `
    :host {
      position: absolute;
      z-index: var(--gf-z-popover);
      top: calc(100% + var(--gf-4));
      right: 0;
      box-shadow: var(--gf-shadow-lift-md);
      padding: var(--gf-8);
      border-radius: var(--gf-12);
      background-color: var(--gf-dark-bg);
    }
    :host(.on-enter) {
      animation: gf-popover-scale-in 150ms cubic-bezier(0.34, 1.8, 0.64, 1),
                 gf-popover-fade-in 150ms linear;
    }
    :host(.on-leave) {
      opacity: 0;
      transition: opacity 150ms ease-out
    }
    button {
      font-size: var(--gf-text-sm);
      text-align: center;
      padding: 0 var(--gf-16);
      background-color: transparent;
      border: none;
      color: var(--dark-text);
      border-radius: var(--gf-8);
      height: var(--gf-32);
      text-decoration: none;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--gf-dark-bg-light);
      }
    }
  `,
})
export class ProfileActionsPopoverComponent {
  readonly profileContext  = inject(ProfileContext);
  readonly userApi         = inject(UserApi);

  readonly popupController = new PopupController('gf-profile-actions-popover');

  onUnfriend() {
    console.log(this.profileContext.friendship());
    this.popupController.close();
  }
}
