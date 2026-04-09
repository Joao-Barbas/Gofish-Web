// user-manager.service.ts

import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import { UserApi } from '@gofish/shared/api/user.api';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { AuthService } from '@gofish/shared/services/auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Gender } from '@gofish/shared/enums/gender.enum';

interface UserState {
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string | undefined;
  phoneNumber: string | undefined;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  bio: string | undefined;
  avatarUrl: string | undefined;
  birthDate: string | undefined;
  gender: Gender | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  private readonly userApi        = inject(UserApi);
  private readonly userProfileApi = inject(UserProfileApi);
  private readonly authService    = inject(AuthService);

  private readonly userResource = rxResource({
    params: () => {
      const id = this.authService.userId();
      return id ? { id } : undefined;
    },
    stream: ({ params }) => forkJoin({
      settings:        this.userApi.getUserSettings(),
      profileSettings: this.userProfileApi.getUserProfileSettings()
    }).pipe(
      map(({ settings, profileSettings }) => ({
        userName:             settings.userName,
        displayName:          settings.displayName,
        firstName:            settings.firstName,
        lastName:             settings.lastName,
        email:                settings.email,
        phoneNumber:          settings.phoneNumber,
        emailConfirmed:       settings.emailConfirmed,
        phoneNumberConfirmed: settings.phoneNumberConfirmed,
        bio:                  profileSettings.bio,
        avatarUrl:            profileSettings.avatarUrl,
        birthDate:            settings.birthDate,
        gender:               settings.gender,
      } as UserState))
    ),
  });

  private readonly _state = this.userResource.value;
  readonly state = this._state.asReadonly();

  readonly userName             = computed(() => this._state()?.userName);
  readonly displayName          = computed(() => this._state()?.displayName);
  readonly firstName            = computed(() => this._state()?.firstName);
  readonly lastName             = computed(() => this._state()?.lastName);
  readonly email                = computed(() => this._state()?.email);
  readonly phoneNumber          = computed(() => this._state()?.phoneNumber);
  readonly emailConfirmed       = computed(() => this._state()?.emailConfirmed ?? false);
  readonly phoneNumberConfirmed = computed(() => this._state()?.phoneNumberConfirmed ?? false);
  readonly bio                  = computed(() => this._state()?.bio);
  readonly avatarUrl            = computed(() => this._state()?.avatarUrl);
  readonly birthDate            = computed(() => this._state()?.birthDate);
  readonly gender               = computed(() => this._state()?.gender);

  // Reload everything from backend

  async refetchData(): Promise<void> {
    const data = await firstValueFrom(forkJoin({
      settings:        this.userApi.getUserSettings(),
      profileSettings: this.userProfileApi.getUserProfileSettings()
    }));
    this.userResource.set({
      userName:             data.settings.userName,
      displayName:          data.settings.displayName,
      firstName:            data.settings.firstName,
      lastName:             data.settings.lastName,
      email:                data.settings.email,
      phoneNumber:          data.settings.phoneNumber,
      emailConfirmed:       data.settings.emailConfirmed,
      phoneNumberConfirmed: data.settings.phoneNumberConfirmed,
      bio:                  data.profileSettings.bio,
      avatarUrl:            data.profileSettings.avatarUrl,
      birthDate:            data.settings.birthDate,
      gender:               data.settings.gender,
    } as UserState);
  }

  // User mutations
  // Each calls the api and updates state on success.

  updateDisplayName(displayName: string): Observable<void> {
    return this.userApi.patchUser({ displayName }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, displayName })))
    );
  }

  updateFirstName(firstName: string): Observable<void> {
    return this.userApi.patchUser({ firstName }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, firstName })))
    );
  }

  updateLastName(lastName: string): Observable<void> {
    return this.userApi.patchUser({ lastName }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, lastName })))
    );
  }

  updateUserName(userName: string): Observable<void> {
    return this.userApi.patchUser({ userName }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, userName })))
    );
  }

  updateBirthDate(birthDate: string): Observable<void> {
    return this.userApi.patchUser({ birthDate }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, birthDate })))
    );
  }

  updateGender(gender: Gender): Observable<void> {
    return this.userApi.patchUser({ gender }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, gender })))
    );
  }

  // Profile mutations

  updateBio(bio: string): Observable<void> {
    return this.userProfileApi.patchUserProfile({ bio }).pipe(
      tap(() => this._state.update(s => s && ({ ...s, bio })))
    );
  }

  updateAvatar(avatar: File): Observable<void> {
    const userId = this.authService.userId()!;
    return this.userProfileApi.patchUserProfile({ avatar }).pipe(
      switchMap(() => this.userProfileApi.getUserAvatar(userId)),
      tap(avatarUrl => this.userResource.update(s => s && ({ ...s, avatarUrl }))),
      map(() => {})
    );
  }
}
