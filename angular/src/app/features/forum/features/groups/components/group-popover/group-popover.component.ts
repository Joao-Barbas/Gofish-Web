import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupMemberSettingsPopoverComponent } from '@gofish/features/forum/features/groups/components/group-member-settings-popover/group-member-settings-popover.component';
import { PopoverKey, PopoverController } from '@gofish/shared/core/popover-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { MouseFollowDirective } from '@gofish/shared/directives/mouse-follow.directive';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { GroupRole } from '@gofish/shared/enums/group-role.enum';

@Component({
  selector: 'gf-group-popover',
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
  imports: [CommonModule,
    MouseFollowDirective],
  templateUrl: './group-popover.component.html',
  styleUrl: './group-popover.component.css',
})
export class GroupPopoverComponent {
  static readonly Key: PopoverKey = 'gf-group-settings-popover';
  readonly controller = new PopoverController(GroupPopoverComponent.Key);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);


  viewerRole = input.required<GroupRole>();

  member = input.required<GroupMemberDTO>();

  protected readonly Role = GroupRole;

  onAction(action: string) {
    console.log(`${action} member:`, this.member().userId);
    this.controller.close();
  }

  invite() {
    this.controller.close();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['invite'], { relativeTo: this.route });
  }
}
