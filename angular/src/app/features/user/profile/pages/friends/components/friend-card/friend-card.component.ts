import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';

@Component({
  selector: 'app-friend-card',
  imports: [RouterLink],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.css',
})
export class FriendCardComponent {
  public avatarUrl     = input<string>('assets/vectors/avatar-template-dark.clr.svg');
  public userId        = input<string>('');
  public userName      = input<string>('Unknown');
  public userFirstName = input<string>('Unknown');
  public userLastName  = input<string>('Unknown');
  public showActions   = input<boolean>(false);

  public accepted = output<string>();
  public declined = output<string>();
}
