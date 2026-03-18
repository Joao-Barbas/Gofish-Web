import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-groups-list-card',
  imports: [RouterLink],
  templateUrl: './groups-list-card.component.html',
  styleUrl: './groups-list-card.component.css',
})
export class GroupsListCardComponent {
  public avatarUrl      = input<string>('assets/vectors/avatar-template-dark.clr.svg');
  public groupId        = input<string>('');
  public groupName      = input<string>('Unknown');
  public groupDesc      = input<string>('Unknown');
  public groupMemberQty = input<number>(0);
  public groupPostQty   = input<number>(0);
  public showActions    = input<boolean>(true);

  public accepted = output<string>();
  public declined = output<string>();
}
