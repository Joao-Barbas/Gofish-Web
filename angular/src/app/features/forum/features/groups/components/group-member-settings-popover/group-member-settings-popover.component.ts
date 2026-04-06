import { Component, input, inject} from '@angular/core';
import { GroupMemberDTO } from '@gofish/shared/dtos/group.dto';
import { PopoverService } from '@gofish/shared/services/popover.service';

@Component({
  selector: 'app-group-member-settings-popover',
  imports: [],
  templateUrl: './group-member-settings-popover.component.html',
  styleUrl: './group-member-settings-popover.component.css',
})
export class GroupMemberSettingsPopoverComponent {

  member = input.required<GroupMemberDTO>();

  protected readonly popoverService = inject(PopoverService);

  close() {
    this.popoverService.close();
  }

  onKick() {
    console.log('Kicking user:', this.member().userId);
    this.close();
  }
}
