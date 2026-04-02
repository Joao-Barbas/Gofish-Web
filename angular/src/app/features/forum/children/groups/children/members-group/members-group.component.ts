import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetGroupPostsResDTO, GetGroupPostsReqDTO, GetGroupMembersReqDTO, GetGroupMembersResDTO } from '@gofish/shared/dtos/group.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { UserCardComponent } from "../../components/user-card/user-card.component";

@Component({
  selector: 'gf-members-group',
  imports: [UserCardComponent],
  templateUrl: './members-group.component.html',
  styleUrl: './members-group.component.css',
})
export class MembersGroupComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  protected membersData = signal<GetGroupMembersResDTO | null>(null);

  ngOnInit() {

    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    console.log(id);
    if (!id) return;
    const dto: GetGroupMembersReqDTO = {
      groupId: id,
      maxResults: 5
    }
    this.groupsService.getGroupMembers(dto).subscribe({
      next: (res) => {
        this.membersData.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
