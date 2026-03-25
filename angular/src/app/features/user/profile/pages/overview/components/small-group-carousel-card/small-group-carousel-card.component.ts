// small-group-carousel-card.component.ts

import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { Path, PathSegment } from '@gofish/shared/constants';
import { UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'gf-small-group-carousel-card',
  imports: [RouterLink],
  templateUrl: './small-group-carousel-card.component.html',
  styleUrl: './small-group-carousel-card.component.css',
})
export class SmallGroupCarouselCardComponent {
  readonly profileContext = inject(ProfileContext);
  readonly avatarService  = inject(AvatarService);

  public readonly PathSegment = PathSegment;
  public readonly Path        = Path;

  group = input.required<UserGroupDTO>();
}
