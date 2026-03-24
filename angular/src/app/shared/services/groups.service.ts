import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { CreateGroupReqDTO, CreateGroupResDTO, GetGroupReqDTO, GetGroupResDTO, GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient);

  getGroup(dto: GetGroupReqDTO): Observable<GetGroupResDTO>{
    return this.http.post<GetGroupResDTO>(Api.Group.action('GetGroup'), dto);
  }

  createGroup(formData: FormData): Observable<CreateGroupResDTO>{
    return this.http.post<CreateGroupResDTO>(Api.Group.action('CreateGroup'), formData);
  }

  getUserGroups(): Observable<GetUserGroupsResDTO>{
    return this.http.get<GetUserGroupsResDTO>(Api.Group.action('GetUserGroups'));
  }

}
