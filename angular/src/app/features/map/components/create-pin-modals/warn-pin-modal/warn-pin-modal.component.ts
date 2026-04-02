import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { BusyState } from '@gofish/shared/core/busy-state';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { BodyLengthConstraints } from '@gofish/shared/constants';


@Component({
  selector: 'app-warn-pin-modal',
  imports: [CommonModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './warn-pin-modal.component.html',
  styleUrl: './warn-pin-modal.component.css',
})
export class WarnPinModalComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private readonly fb = inject(FormBuilder);
  private readonly urlService = inject(UrlService);
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  protected readonly BodyLengthConstraints = BodyLengthConstraints;
  values: UrlQuery | null = null;
  busyState: BusyState = new BusyState();

  selectedCoords: Coords | null = null;

  warnTypeOptions: EnumDTO[] = [];
  visibilityOptions: EnumDTO[] = [];

  errorMessage = '';
  userGroups = signal<GetUserGroupsResDTO['groups']>([]);
  selectedGroupIds = signal<number[]>([]);

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(BodyLengthConstraints.MIN), Validators.maxLength(BodyLengthConstraints.MAX)]],
    visibility: [0, Validators.required],
    warningKind: [0, Validators.required],
    groupIds: this.fb.control<number[]>([])
  });

  ngOnInit(): void {
    this.pinService.enumerateWarnType().subscribe({
      next: (res: EnumDTO[]) => {
        this.warnTypeOptions = res;
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

    this.route.queryParamMap.subscribe(paramMap => {
      this.values = this.urlService.getUrlValues(paramMap);

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
      };

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

    const dto: CreateWarnPinReqDTO = {
      latitude: this.selectedCoords!.latitude,
      longitude: this.selectedCoords!.longitude,
      visibility: this.form.value.visibility!,
      body: this.form.value.body ?? '',
      warningKind: Number(this.form.value.warningKind!),
      groupIds: groupIds
    };
    console.log('DTO to be sent:', dto);
    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createWarnPin(dto).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Warn Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: (err) => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create warn pin. Please try again.';
        toast.error(this.errorMessage);
        console.log(err);
      }
    });
  }
}
