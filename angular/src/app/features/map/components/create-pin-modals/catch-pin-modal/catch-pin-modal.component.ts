import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { toast } from 'ngx-sonner';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { GroupsService } from '@gofish/shared/services/groups.service';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';

@Component({
  selector: 'app-catch-pin-modal',
  imports: [CommonModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './catch-pin-modal.component.html',
  styleUrl: './catch-pin-modal.component.css'
})
export class CatchPinModalComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly urlService = inject(UrlService);
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupsService);
  values: UrlQuery | null = null;
  busyState: BusyState = new BusyState();

  selectedCoords: Coords | null = null;

  visibilityOptions: EnumDTO[] = [];
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];

  hookSize: string = '';
  body: string = '';
  image: File | null = null;

  errorMessage: string = '';
  userGroups = signal<GetUserGroupsResDTO['groups']>([]);
  selectedGroupIds = signal<number[]>([]);

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    visibility: [0],
    species: [0],
    bait: [0],
    hook: [''],
    imageUrl: [null, [Validators.required]],
    groupIds: this.fb.control<number[]>([])
  });

  ngOnInit(): void {
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
      }
    });

    this.pinService.enumerateSpeciesType().subscribe({
      next: (res: EnumDTO[]) => this.speciesOptions = res
    });

    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res
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
      };
    });

    this.groupService.getUserGroups().subscribe({
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowedTypes = ['image/png', 'image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG or JPEG images are allowed');
      return;
    }

    this.image = file;
  }


  onCancel(): void {
    toast.info('You cancel the creation');
    this.router.navigate(['/map'], {
      queryParams: {
        lat: this.selectedCoords?.latitude,
        lng: this.selectedCoords?.longitude,
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

    if (!this.image) {
      this.errorMessage = 'Please upload an image.';
      return;
    }
    const visibility = Number(this.form.value.visibility);
    const groupIds = this.form.value.groupIds ?? [];
    if (visibility === 2 && groupIds.length === 0) {
      this.errorMessage = 'Select at least one group.';
      return;
    }
    this.busyState.setBusy(true);

    const formData = new FormData();
    formData.append('Latitude', this.selectedCoords.latitude.toString());
    formData.append('Longitude', this.selectedCoords.longitude.toString());
    formData.append('Image', this.image);
    formData.append('Body', this.form.value.body!);
    formData.append('Visibility', String(this.form.value.visibility));
    formData.append('Species', String(this.form.value.species));
    formData.append('Bait', String(this.form.value.bait));
    formData.append('HookSize', this.form.value.hook ?? '');
    groupIds.forEach(id => {
      formData.append('GroupIds', id.toString());
    });

    const toastId = toast.loading('Publishing your pin!');
    console.log(formData);
    this.pinService.createCatchPin(formData).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Catch Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create catch pin. Please try again.';
        toast.error(this.errorMessage);
      }
    });
  }
}
