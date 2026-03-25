// small-friendship-carousel-card.component.ts

import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { AvatarService } from '@gofish/shared/services/avatar.service';

@Component({
  selector: 'gf-small-friendship-carousel-card',
  imports: [RouterLink],
  templateUrl: './small-friendship-carousel-card.component.html',
  styleUrl: './small-friendship-carousel-card.component.css',
})
export class SmallFriendshipCarouselCardComponent {
  readonly profileContext = inject(ProfileContext);
  readonly avatarService  = inject(AvatarService);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  friendship = input.required<FriendshipDTO>();
}
