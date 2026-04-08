// general.component.ts

import { Component, effect, inject, resource, signal } from '@angular/core';
import { UserApi } from '@gofish/shared/api/user.api';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { Router, RouterLink } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { FallbackPipe } from "@gofish/shared/pipes/fallback.pipe"
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { ModalService } from '@gofish/shared/services/modal.service';
import { ChangeUsernameModalComponent } from "./components/change-username-modal/change-username-modal.component";
import { ChangeFirstnameModalComponent } from "./components/change-firstname-modal/change-firstname-modal.component";
import { ChangeLastnameModalComponent } from "./components/change-lastname-modal/change-lastname-modal.component";
import { ChangeEmailModalComponent } from '@gofish/features/user/settings/components/general/components/change-email-modal/change-email-modal.component';
import { VerifyEmailModalComponent } from '@gofish/features/user/settings/components/general/components/verify-email-modal/verify-email-modal.component';
import { ChangePhoneModalComponent } from '@gofish/features/user/settings/components/general/components/change-phone-modal/change-phone-modal.component';

@Component({
  selector: 'app-general',
  imports: [
    LoadingSpinnerComponent,
    RouterLink,
    ReactiveFormsModule,
    FallbackPipe,
    CdkTextareaAutosize,
    FormsModule,
    AsyncButtonComponent,
    ChangeUsernameModalComponent,
    ChangeLastnameModalComponent,
    ChangeFirstnameModalComponent,
    ChangeEmailModalComponent,
    VerifyEmailModalComponent,
    ChangePhoneModalComponent
],
  templateUrl: './general.component.html',
  styleUrl: './general.component.css',
})
export class GeneralComponent {
  readonly router         = inject(Router);
  readonly avatarService  = inject(AvatarService);
  readonly formBuilder    = inject(FormBuilder);
  readonly userProfileApi = inject(UserProfileApi);
  readonly userApi        = inject(UserApi);
  readonly modalService   = inject(ModalService);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  readonly ChangeEmailModalComponent = ChangeEmailModalComponent;
  readonly VerifyEmailModalComponent = VerifyEmailModalComponent;
  readonly toast = toast;

  Path = Path;
  PathSegment = PathSegment;

  userSettings = resource({
    loader: () => firstValueFrom(this.userApi.getUserSettings())
  });

  userProfileSettings = resource({
    loader: () => firstValueFrom(this.userProfileApi.getUserProfileSettings())
  });

  constructor() {
    effect(() => {
      if (!this.userProfileSettings.hasValue()) return;
      let profile = this.userProfileSettings.value();
      this.currentBio = profile.bio ?? '';
      this.savedBio = profile.bio ?? '';
      this.avatarPreview.set(profile.avatarUrl ?? null);
    })
  }

  // Bio

  currentBio: string   = '';
  savedBio: string     = '';
  saveSuccess: boolean = false;

  onBioSave() {
    this.saveSuccess = false;
    this.busyState.setBusy(true);
    this.userProfileApi.patchUserProfile({
      bio: this.currentBio
    }).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.saveSuccess = true;
        setTimeout(() => {
          this.saveSuccess = false;
          this.savedBio = this.currentBio;
        }, 2000);
      },
      error: () => {
        this.busyState.setBusy(false);
        this.toast.error('Something went saving biography');
      }
    });
  }

  // End bio
  // Avatar

  avatarPreview = signal<string | null>(null);
  avatarFile    = signal<File | null>(null);

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.toast.error('Invalid file type! Valid file types include JPEG and PNG');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      this.toast.error('File is too big! Maximum file size is 3mb');
      return;
    }
    this.busyState.setBusy(true);
    this.userProfileApi.patchUserProfile({
      avatar: file
    }).subscribe({
      next: () => {
        this.toast.success('Avatar uploaded successfully');
        this.avatarFile.set(file);
        let reader = new FileReader();
        reader.onload = () => this.avatarPreview.set(reader.result as string | null);
        reader.readAsDataURL(file);
        this.busyState.setBusy(false);
      },
      error: () => {
        this.toast.error('Something went wrong uploading avatar');
        this.busyState.setBusy(false);
      },
    });
  }

  // End avatar
  // Modal events

  onUsernameChange(username: string) {
    if (!this.userSettings.hasValue()) return;
    this.userSettings.value().userName = username;
  }

  onFirstnameChange(firstname: string) {
    if (!this.userSettings.hasValue()) return;
    this.userSettings.value().firstName = firstname;
  }

  onLastnameChange(lastname: string) {
    if (!this.userSettings.hasValue()) return;
    this.userSettings.value().lastName = lastname;
  }

  onPhoneNumberChange(phoneNumber: string) {
    if (!this.userSettings.hasValue()) return;
    this.userSettings.value().phoneNumber = phoneNumber;
  }

  onEmailChange(email: string) {
    if (!this.userSettings.hasValue()) return;
    this.userSettings.value().email = email;
  }

  onEmailVerified() {
    this.userSettings.reload();
  }

  // End modals events
}
