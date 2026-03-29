import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { toast } from 'ngx-sonner';
import { groupBy, Subscription } from 'rxjs';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { GroupsService } from '@gofish/shared/services/groups.service';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';

@Component({
  selector: 'app-info-pin-modal',
  imports: [CommonModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './info-pin-modal.component.html',
  styleUrl: './info-pin-modal.component.css',
})
export class InfoPinModalComponent implements OnInit {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly urlService = inject(UrlService);
  private readonly fb = inject(FormBuilder);
  private readonly groupsService = inject(GroupsService);
  values: UrlQuery | null = null;
  busyState: BusyState = new BusyState();

  selectedCoords: Coords | null = null;

  visibilityOptions: EnumDTO[] = [];
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];

  errorMessage: string = '';
  userGroups = signal<GetUserGroupsResDTO['groups']>([]);
  selectedGroupIds = signal<number[]>([]);

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    visibility: [0, [Validators.required]],
    accessDifficulty: [0, [Validators.required]],
    seaBed: [0, [Validators.required]],
    groupIds: this.fb.control<number[]>([])
  });


  ngOnInit(): void {
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: EnumDTO[]) => {
        this.seaBedOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res: EnumDTO[]) => {
        this.accessDifficultyOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });

    this.route.queryParamMap.subscribe(queryParamMap => {
      this.values = this.urlService.getUrlValues(queryParamMap);

      if (!this.values) {
        this.selectedCoords = null;
        return;
      }
      const lng = this.values.sLng;
      const lat = this.values.sLat;

      if (!lng || !lat) return;

      if (!this.urlService.isLngLatValid(lng, lat)) {
        this.selectedCoords = null;
        return;
      }

      this.selectedCoords = {
        longitude: lng,
        latitude: lat
      }
    });

    this.groupsService.getUserGroups().subscribe({
      next: (res) => {
        this.userGroups.set(res.groups);
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.form.controls.visibility.valueChanges.subscribe(value => {
      if (Number(value) !== 2) {
        this.selectedGroupIds.set([]);
        this.form.controls.groupIds.setValue([]);
      }
    });

  }

  toggleGroup(groupId: number) {
    const current = this.selectedGroupIds();

    const updated = current.includes(groupId) ? current.filter(id => id !== groupId) : [...current, groupId]

    this.selectedGroupIds.set(updated);
    this.form.controls.groupIds.setValue(updated);
  }

  onCancel(): void {
    toast.info('You cancel the creation');
    this.router.navigate(['/map'], {
      queryParams: {
        vLat: this.selectedCoords?.latitude,
        vLng: this.selectedCoords?.longitude,
        z: this.values?.z
      }
    });
  }

  onPublish(): void {
    this.errorMessage = '';

    if (!this.selectedCoords) {
      this.errorMessage = 'No valid coords';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const visibility = Number(this.form.value.visibility);
    const groupIds = this.form.value.groupIds ?? [];
    if (visibility === 2 && groupIds.length === 0) {
      this.errorMessage = 'Select at least one group.';
      return;
    }
    this.busyState.setBusy(true);

    const dto: CreateInfoPinReqDTO = {
      latitude: this.selectedCoords.latitude,
      longitude: this.selectedCoords.longitude,
      visibility: Number(this.form.value.visibility!),
      body: this.form.value.body ?? '',
      accessDifficulty: Number(this.form.value.accessDifficulty!),
      seaBedType: Number(this.form.value.seaBed!),
      groupIds: groupIds
    };
    console.log(dto);

    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createInfoPin(dto).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Info Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        this.busyState.setBusy(false);
        this.errorMessage = 'Failed to create info pin. Please try again.';
        toast.dismiss(toastId);
        toast.error(this.errorMessage);
      }
    });
  }

}
