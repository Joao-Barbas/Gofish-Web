import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GroupApi } from '@gofish/shared/api/group.api';
import { Api } from '@gofish/shared/constants';
import { CreateGroupReqDTO, CreateGroupResDTO, GetGroupMembersReqDTO, GetGroupMembersResDTO, GetGroupPinsReqDto, GetGroupPinsResDto, GetGroupPostsReqDTO, GetGroupPostsResDTO, GetGroupReqDTO, GetGroupResDTO, GetUserGroupsResDTO, GroupDTO } from '@gofish/shared/dtos/group.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly groupApi = inject(GroupApi);

  getGroup(id: number): Observable<GroupDTO>{
    return this.groupApi.getGroup(id);
  }

  createGroup(formData: FormData): Observable<CreateGroupResDTO>{
    return this.http.post<CreateGroupResDTO>(Api.Group.action('CreateGroup'), formData);
  }

  getUserGroups(): Observable<GetUserGroupsResDTO>{
    return this.http.get<GetUserGroupsResDTO>(Api.Group.action('GetUserGroups'));
  }

  getGroupMembers(dto: GetGroupMembersReqDTO): Observable<GetGroupMembersResDTO> {
    return this.groupApi.getGroupMembers(dto);
  }

  getGroupPosts(dto: GetGroupPinsReqDto): Observable<GetGroupPinsResDto> {
    return this.groupApi.getGroupPosts(dto);
  }
}
