import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';

@Component({
  selector: 'app-group-card',
  imports: [RouterLink],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.css',
})
export class GroupCardComponent {
  public readonly PathSegment = PathSegment;
  public readonly Path        = Path;

  public avatarUrl = input<string>('assets/vectors/avatar-template-dark.clr.svg');
  public groupId   = input<string>('');
  public groupName = input<string>('Unknown');
}
