// user-profile.api.ts

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetUserProfileResDTO, PatchUserProfileReqDTO, PutUserProfileReqDTO } from "@gofish/shared/dtos/user-profile.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserProfileApi {
  private readonly http = inject(HttpClient);

  public getUserProfile(id: string): Observable<GetUserProfileResDTO> {
    return this.http.get<GetUserProfileResDTO>(Api.UserProfile.action(`GetUserProfile/${id}`));
  }

  public putUserProfile(dto: PutUserProfileReqDTO): Observable<void> {
    return this.http.put<void>(Api.UserProfile.action('PutUserProfile'), dto);
  }

  public patchUserProfile(dto: PatchUserProfileReqDTO): Observable<void> {
    return this.http.patch<void>(Api.UserProfile.action('PatchUserProfile'), dto);
  }
}
