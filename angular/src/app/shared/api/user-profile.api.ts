// user-profile.api.ts

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { GetUserProfileSettingsResDTO, PatchUserProfileReqDTO, PutUserProfileReqDTO, UserProfileDTO } from "@gofish/shared/dtos/user-profile.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserProfileApi {
  private readonly http = inject(HttpClient);

  public getUserProfile(id: string): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(Api.UserProfile.action(`GetUserProfile/${id}`));
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

  public getUserAvatar(id: string): Observable<string> {
    const url = Api.UserProfile.action(`GetUserAvatar/${id}`);
    return this.http.get(url, { responseType: 'text' });
  }
}
