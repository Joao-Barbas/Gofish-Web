// users-list-card.component.ts

import { Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SearchUserDTO } from "@gofish/shared/dtos/user.dto";
import { AvatarService } from "@gofish/shared/services/avatar.service";
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";

@Component({
  selector: 'gf-users-list-card',
  imports: [RouterLink, UserTitleComponent],
  templateUrl: './users-list-card.component.html',
  styleUrl: './users-list-card.component.css',
})
export class UsersListCardComponent {
  readonly avatar = inject(AvatarService);
  readonly user = input.required<SearchUserDTO>();
}
