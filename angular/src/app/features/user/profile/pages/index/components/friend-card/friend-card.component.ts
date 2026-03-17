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
  public readonly PathSegment = PathSegment;
  public readonly Path        = Path;

  public avatarUrl = input<string>('assets/vectors/avatar-template-dark.clr.svg');
  public userId    = input<string>('');
  public userName  = input<string>('Unknown');
}
