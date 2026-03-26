// group.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { SignInReqDTO, SignInResDTO, SignUpReqDTO, SignUpResDTO, TwoFactorSignInReqDTO, TwoFactorSignInResDTO } from "@gofish/shared/dtos/auth.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GroupApi {
  // private readonly http = inject(HttpClient);

  // GetUserGroups_2(dto: SignUpReqDTO): Observable<SignUpResDTO> {
  //   return this.http.post<SignUpResDTO>(Api.Auth.action('SignUp'), dto);
  // }

  // public getFriendships(options: {
  //   userId?: string;
  //   state?: FriendshipState;
  //   maxResults?: number;
  //   lastTimestamp?: string;
  // } = {}): Observable<GetFriendshipsResDTO> {
  //   let params = new HttpParams();
  //   if (options.userId) params = params.set('userId', options.userId);
  //   if (options.state != null) params = params.set('state', options.state);
  //   if (options.maxResults) params = params.set('maxResults', options.maxResults);
  //   if (options.lastTimestamp) params = params.set('lastTimestamp', options.lastTimestamp);
  //   return this.http.get<GetFriendshipsResDTO>(Api.User.action('GetFriendships'), { params });
  // }
}
