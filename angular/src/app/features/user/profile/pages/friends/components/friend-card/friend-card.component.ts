import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';
import { FriendshipDTO, FriendshipUserDTO } from '@gofish/shared/dtos/user.dto';

@Component({
  selector: 'app-friend-card',
  imports: [RouterLink],
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.css',
})
export class FriendCardComponent {
  readonly defaultAvatar = 'assets/vectors/avatar-template-dark.clr.svg';

  friendship = input.required<FriendshipDTO>();
  user       = input.required<FriendshipUserDTO>();
  actions    = input.required<boolean>();

  accepted = output<FriendshipDTO>();
  declined = output<FriendshipDTO>();

  onAccept() {
    this.accepted.emit(this.friendship());
  }

  onDecline() {
    this.declined.emit(this.friendship());
  }
}
