// group.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetGroupMembersReqDTO, GetGroupMembersResDTO, GetGroupPostsReqDTO, GetGroupPostsResDTO, SearchGroupsReqDTO, SearchGroupsResDTO } from "@gofish/shared/dtos/group.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GroupApi/*Service*/ {
  private readonly http = inject(HttpClient);

  public getGroupMembers(dto: GetGroupMembersReqDTO): Observable<GetGroupMembersResDTO> {
    let p = new HttpParams();
    if (dto.groupId)       p = p.set('groupId', dto.groupId);
    if (dto.role)          p = p.set('role', dto.role);
    if (dto.maxResults)    p = p.set('maxResults', dto.maxResults);
    if (dto.lastTimestamp) p = p.set('lastTimestamp', dto.lastTimestamp);
    return this.http.get<GetGroupMembersResDTO>(Api.Group.action('GetGroupMembers'), { params: p });
  }

  public getGroupPosts(dto: GetGroupPostsReqDTO): Observable<GetGroupPostsResDTO> {
    let p = new HttpParams();
    if (dto.groupId)       p = p.set('groupId', dto.groupId);
    if (dto.kind)          p = p.set('kind', dto.kind);
    if (dto.maxResults)    p = p.set('maxResults', dto.maxResults);
    if (dto.lastTimestamp) p = p.set('lastTimestamp', dto.lastTimestamp);
    return this.http.get<GetGroupPostsResDTO>(Api.Group.action('GetGroupPosts'), { params: p });
  }

  public searchGroups(dto: SearchGroupsReqDTO): Observable<SearchGroupsResDTO> {
    let p = new HttpParams();
    if (dto.query)         p = p.set('query', dto.query);
    if (dto.maxResults)    p = p.set('maxResults', dto.maxResults);
    if (dto.lastGroupName) p = p.set('lastGroupName', dto.lastGroupName);
    return this.http.get<SearchGroupsResDTO>(Api.Group.action('SearchGroups'), { params: p });
  }
}
