// user.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetFriendshipsResDTO } from "@gofish/shared/dtos/user.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private readonly http = inject(HttpClient);

  public getFriendships(options: {
    includeFriends?: boolean;
    includeRequested?: boolean;
    includeReceived?: boolean;
    maxResults?: number;
    lastTimestamp?: string;
  } = {}): Observable<GetFriendshipsResDTO> {
    let params = new HttpParams();

    if (options.includeFriends) params = params.set('includeFriends', true);
    if (options.includeRequested) params = params.set('includeRequested', true);
    if (options.includeReceived) params = params.set('includeReceived', true);
    if (options.maxResults) params = params.set('maxResults', options.maxResults.toString());
    if (options.lastTimestamp) params = params.set('lastTimestamp', options.lastTimestamp);

    return this.http.get<GetFriendshipsResDTO>(Api.User.action('GetFriendships'), { params });
  }

  public requestFriendship(receiverId: string): Observable<void> {
    let params = new HttpParams().set('receiverId', receiverId);
    return this.http.post<void>(Api.User.action('RequestFriendship'), null, { params });
  }

  public acceptFriendship(requesterId: string): Observable<void> {
    let params = new HttpParams().set('requesterId', requesterId);
    return this.http.patch<void>(Api.User.action('AcceptFriendship'), null, { params });
  }

  public ignoreFriendship(requesterId: string): Observable<void> {
    let params = new HttpParams().set('requesterId', requesterId);
    return this.http.patch<void>(Api.User.action('IgnoreFriendship'), null, { params });
  }

  public deleteFriendship(receiverId: string): Observable<void> {
    let params = new HttpParams().set('receiverId', receiverId);
    return this.http.delete<void>(Api.User.action('DeleteFriendship'), { params });
  }
}
