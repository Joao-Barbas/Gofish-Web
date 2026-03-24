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

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  protected readonly toast = toast;

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
      bio: this.savedBio
    }).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => {
          this.saveSuccess = false;
          this.savedBio = this.currentBio;
        }, 2000);
      },
      error: () => {
        this.toast.error('Something went saving biography');
      },
      complete: () => {
        this.busyState.setBusy(false);
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
      },
      error: () => {
        this.toast.error('Something went wrong uploading avatar');
      },
      complete: () => {
        this.busyState.setBusy(false);
      }
    });
  }

  // End avatar
}
