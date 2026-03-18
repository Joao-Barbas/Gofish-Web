import { Component } from '@angular/core';
import { FriendCardComponent } from '@gofish/features/user/profile/pages/friends/components/friend-card/friend-card.component';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button/async-button.component';

@Component({
  selector: 'app-requests-list',
  imports: [FriendCardComponent, AsyncButtonComponent],
  templateUrl: './requests-list.component.html',
  styleUrl: '../../friends.component.css',
})
export class RequestsListComponent {

}
