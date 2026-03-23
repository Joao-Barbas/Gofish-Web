// user.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { FriendshipDTO, GetFriendshipsResDTO, GetUserResDTO, RequestFriendshipReqDTO, RequestFriendshipResDTO } from "@gofish/shared/dtos/user.dto";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private readonly http = inject(HttpClient);

  public getUser(id: string): Observable<GetUserResDTO> {
    return this.http.get<GetUserResDTO>(Api.User.action(`GetUser/${id}`));
  }

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
}
