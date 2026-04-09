import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GroupApi } from '@gofish/shared/api/group.api';
import { Api } from '@gofish/shared/constants';
import { CreateGroupReqDTO, CreateGroupResDTO, GetGroupMembersReqDTO, GetGroupMembersResDTO, GetGroupPinsReqDto, GetGroupPinsResDto, GetGroupPostsReqDTO, GetGroupPostsResDTO, GetGroupReqDTO, GetGroupResDTO, GetUserGroupsResDTO, GroupDTO, SendGroupInviteReqDTO, SendGroupInviteResDTO } from '@gofish/shared/dtos/group.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly groupApi = inject(GroupApi);

  getGroup(id: number): Observable<GroupDTO> {
    return this.groupApi.getGroup(id);
  }

  createGroup(formData: FormData): Observable<CreateGroupResDTO> {
    return this.http.post<CreateGroupResDTO>(Api.Group.action('CreateGroup'), formData);
  }

  getUserGroups(): Observable<GetUserGroupsResDTO> {
    return this.http.get<GetUserGroupsResDTO>(Api.Group.action('GetUserGroups'));
  }

  getGroupMembers(dto: GetGroupMembersReqDTO): Observable<GetGroupMembersResDTO> {
    return this.groupApi.getGroupMembers(dto);
  }

  getGroupPosts(dto: GetGroupPinsReqDto): Observable<GetGroupPinsResDto> {
    return this.groupApi.getGroupPosts(dto);
  }
  createGroupInvite(dto: SendGroupInviteReqDTO): Observable<SendGroupInviteResDTO> {
    return this.http.post<SendGroupInviteResDTO>(Api.Group.action('CreateGroupInvite'), dto);
  }

  deleteGroup(groupId: number): Observable<void> {
    return this.http.delete<void>(Api.Group.action(`DeleteGroup/${groupId}`));
  }

  promoteMemberToAdmin(groupId: number, userId: string) {
    return this.http.patch(
      Api.Group.action(`PromoteMemberToAdmin/${groupId}/${userId}`),
      {}
    );
  }

  promoteMemberToOwner(groupId: number, userId: string) {
    return this.http.patch(
      Api.Group.action(`PromoteMemberToOwner/${groupId}/${userId}`),
      {}
    );
  }

  demoteAdminToMember(groupId: number, userId: string) {
    return this.http.patch(
      Api.Group.action(`DemoteAdminToMember/${groupId}/${userId}`),
      {}
    );
  }

  removeMember(groupId: number, userId: string): Observable<void> {
    return this.http.delete<void>(
      Api.Group.action(`RemoveMember/${groupId}/${userId}`)
    );
  }

  leaveGroup(groupId: number): Observable<void> {
    return this.http.delete<void>(Api.Group.action(`LeaveGroup/${groupId}`));
  }

}
