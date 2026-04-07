import { CommonModule } from '@angular/common';
import { Component, input, inject, HostListener, ElementRef, effect, computed } from '@angular/core';
import { ProfileActionsPopoverComponent } from '@gofish/features/user/profile/pages/overview/components/profile-actions-popover/profile-actions-popover.component';
import { PopoverKey, PopoverController } from '@gofish/shared/core/popover-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { PopoverService } from '@gofish/shared/services/popover.service';
import { MouseFollowDirective } from '@gofish/shared/directives/mouse-follow.directive';

@Component({
  selector: 'gf-group-member-settings-popover',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)': "controller.close()"
  },
  imports: [
    CommonModule,
    MouseFollowDirective,
  ],
  templateUrl: './group-member-settings-popover.component.html',
  styleUrl: './group-member-settings-popover.component.css',
})
export class GroupMemberSettingsPopoverComponent {

  static readonly Key: PopoverKey = 'gf-group-member-settings-popover';
  readonly controller = new PopoverController(GroupMemberSettingsPopoverComponent.Key);


  member = input.required<GroupMemberDTO>();

  promoteToOwnerTooltip = computed(() => {
    return `This replaces you with ${this.member().userName} as owner of the group.\nThis action is permanent!`;
  });

  viewerRole = input.required<GroupRole>();

  protected readonly Role = GroupRole;

  // Métodos de ação (exemplo)
  onAction(action: string) {
    console.log(`${action} member:`, this.member().userId);
    this.controller.close();
  }

}
