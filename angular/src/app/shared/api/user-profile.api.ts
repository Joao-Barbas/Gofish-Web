// user-profile.api.ts

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetUserProfileResDTO, GetUserProfileSettingsResDTO, PatchUserProfileReqDTO, PutUserProfileReqDTO } from "@gofish/shared/dtos/user-profile.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserProfileApi {
  private readonly http = inject(HttpClient);

  public getUserProfile(id: string): Observable<GetUserProfileResDTO> {
    return this.http.get<GetUserProfileResDTO>(Api.UserProfile.action(`GetUserProfile/${id}`));
  }

  public getUserProfileSettings(): Observable<GetUserProfileSettingsResDTO> {
    return this.http.get<GetUserProfileSettingsResDTO>(Api.UserProfile.action(`GetUserProfileSettings`));
  }

  public putUserProfile(dto: PutUserProfileReqDTO): Observable<void> {
    const formData = new FormData();
    formData.append('bio', dto.bio);
    formData.append('avatar', dto.avatar);
    return this.http.put<void>(Api.UserProfile.action('PutUserProfile'), formData);
  }

  public patchUserProfile(dto: PatchUserProfileReqDTO): Observable<void> {
    const formData = new FormData();
    if (dto.bio != null) formData.append('bio', dto.bio);
    if (dto.avatar) formData.append('avatar', dto.avatar);
    return this.http.patch<void>(Api.UserProfile.action('PatchUserProfile'), formData);
  }
}
