// groups-list-card.component.ts

import { Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SearchGroupDTO } from "@gofish/shared/dtos/group.dto";
import { AvatarService } from "@gofish/shared/services/avatar.service";

@Component({
  selector: 'gf-groups-list-card',
  imports: [RouterLink],
  templateUrl: './groups-list-card.component.html',
  styleUrl: './groups-list-card.component.css',
})
export class GroupsListCardComponent {
  readonly avatarService = inject(AvatarService);
  readonly group = input.required<SearchGroupDTO>();
}
