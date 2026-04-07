import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetGroupPostsResDTO, GetGroupPostsReqDTO, GetGroupMembersReqDTO, GetGroupMembersResDTO } from '@gofish/shared/dtos/group.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { UserCardComponent } from "../../components/user-card/user-card.component";
import { GroupRole } from '@gofish/shared/enums/group-role.enum';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'gf-members-group',
  imports: [UserCardComponent],
  templateUrl: './members-group.component.html',
  styleUrl: './members-group.component.css',
})
export class MembersGroupComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  protected membersData = signal<GetGroupMembersResDTO | null>(null);

  viewerRole = computed(() => {
    const me = this.membersData()?.members.find(m => m.userId === this.authService.userId());
    return me?.role ?? GroupRole.Member;
  });

  ngOnInit() {

    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
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
