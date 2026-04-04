// user.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { FriendshipDTO, GetFriendshipBetweenReqDTO, GetFriendshipsResDTO, GetUserGroupReqDTO, GetUserGroupResDTO, GetUserResDTO, GetUserSettingsResDTO, LeaderboardResDTO, PatchUserReqDTO, PutUserReqDTO, RequestFriendshipReqDTO, RequestFriendshipResDTO, SearchUsersReqDTO, SearchUsersResDTO } from "@gofish/shared/dtos/user.dto";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private readonly http = inject(HttpClient);

  // User

  public getUser(id: string): Observable<GetUserResDTO> {
    return this.http.get<GetUserResDTO>(Api.User.action(`GetUser/${id}`));
  }

  public getUserSettings(): Observable<GetUserSettingsResDTO> {
    return this.http.get<GetUserSettingsResDTO>(Api.User.action('GetUserSettings'));
  }

  public putUser(dto: PutUserReqDTO): Observable<void> {
    return this.http.put<void>(Api.User.action('PutUser'), dto);
  }

  public patchUser(dto: PatchUserReqDTO): Observable<void> {
    return this.http.patch<void>(Api.User.action('PatchUser'), dto);
  }

  public searchUsers(dto: SearchUsersReqDTO): Observable<SearchUsersResDTO> {
    let p = new HttpParams();
    if (dto.query)        p = p.set('query', dto.query);
    if (dto.maxResults)   p = p.set('maxResults', dto.maxResults);
    if (dto.lastUsername) p = p.set('lastUsername', dto.lastUsername);
    return this.http.get<SearchUsersResDTO>(Api.User.action('SearchUsers'), { params: p });
  }

  public getGlobalLeaderboard(): Observable<LeaderboardResDTO> {
    return this.http.get<LeaderboardResDTO>(Api.User.action('GetGlobalLeaderboard'));
  }

  public getFriendsLeaderboard(): Observable<LeaderboardResDTO> {
    return this.http.get<LeaderboardResDTO>(Api.User.action('GetFriendsLeaderboard'));
  }

  // Friendships

  public getFriendships(options: {
    userId?: string;
    state?: FriendshipState;
    maxResults?: number;
    lastTimestamp?: string;
  } = {}): Observable<GetFriendshipsResDTO> {
    let params = new HttpParams();
    if (options.userId) params = params.set('userId', options.userId);
    if (options.state != null) params = params.set('state', options.state);
    if (options.maxResults) params = params.set('maxResults', options.maxResults);
    if (options.lastTimestamp) params = params.set('lastTimestamp', options.lastTimestamp);
    return this.http.get<GetFriendshipsResDTO>(Api.User.action('GetFriendships'), { params });
  }

  public getFriendship(id: number): Observable<FriendshipDTO> {
    return this.http.get<FriendshipDTO>(Api.User.action(`GetFriendship/${id}`));
  }

  public getFriendshipBetween(dto: GetFriendshipBetweenReqDTO): Observable<FriendshipDTO | null> {
    let p = new HttpParams();
    p = p.set('userId1', dto.userId1);
    p = p.set('userId2', dto.userId2);
    return this.http.get<FriendshipDTO>(Api.User.action(`GetFriendshipBetween`), {
      params: p,
      observe: 'response'
    }).pipe(
      map(response => response.status === 204 ? null : response.body)
    );
  }

  public requestFriendship(dto: RequestFriendshipReqDTO): Observable<RequestFriendshipResDTO> {
    return this.http.post<RequestFriendshipResDTO>(Api.User.action('RequestFriendship'), dto);
  }

  public acceptFriendship(id: number): Observable<void> {
    return this.http.patch<void>(Api.User.action(`AcceptFriendship/${id}`), null);
  }

  public deleteFriendship(id: number): Observable<void> {
    return this.http.delete<void>(Api.User.action(`DeleteFriendship/${id}`));
  }

  public ignoreFriendship(id: number): Observable<void> {
    return this.deleteFriendship(id);
  }

  // Groups

  public getUserGroups(dto: GetUserGroupReqDTO): Observable<GetUserGroupResDTO> {
    let p = new HttpParams();
    if (dto.userId)        p = p.set('userId', dto.userId);
    if (dto.maxResults)    p = p.set('maxResults', dto.maxResults);
    if (dto.lastTimestamp) p = p.set('lastTimestamp', dto.lastTimestamp);
    return this.http.get<GetUserGroupResDTO>(Api.User.action('GetUserGroups'), { params: p });
  }
}
