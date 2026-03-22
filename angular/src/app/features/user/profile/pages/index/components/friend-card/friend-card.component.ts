import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';

@Component({
  selector: 'app-friend-card',
  imports: [RouterLink],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.css',
})
export class FriendCardComponent {
  readonly defaultAvatar = 'assets/vectors/avatar-template-dark.clr.svg';

  public readonly PathSegment = PathSegment;
  public readonly Path        = Path;

  public avatarUrl = input<string | undefined>();
  public userId    = input<string>('');
  public userName  = input<string>('Unknown');
}
