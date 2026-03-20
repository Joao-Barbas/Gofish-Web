// user-profile.api.ts

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetUserProfileResDto, PatchUserProfileReqDto, PutUserProfileReqDto } from "@gofish/shared/dtos/user-profile.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserProfileApi {
  private readonly http = inject(HttpClient);

  public getUserProfile(id: string): Observable<GetUserProfileResDto> {
    return this.http.get<GetUserProfileResDto>(Api.UserProfile.action(`GetUserProfile/${id}`));
  }

  public putUserProfile(dto: PutUserProfileReqDto): Observable<void> {
    return this.http.put<void>(Api.UserProfile.action('PutUserProfile'), dto);
  }

  public patchUserProfile(dto: PatchUserProfileReqDto): Observable<void> {
    return this.http.patch<void>(Api.UserProfile.action('PatchUserProfile'), dto);
  }
}
