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
import { BodyLengthConstraints } from '@gofish/shared/constants';
import { V } from '@angular/cdk/keycodes';

/**
 * Modal component responsible for creating a catch pin.
 *
 * Responsibilities:
 * - Load selectable enum values required by the form
 * - Read selected coordinates from the URL
 * - Allow image upload and group-based visibility selection
 * - Build and submit multipart form data for catch pin creation
 */
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

  /** Shared body length validation constraints exposed to the template. */
  protected readonly BodyLengthConstraints = BodyLengthConstraints;

  /** Parsed URL values used to restore map-related state. */
  values: UrlQuery | null = null;

  /** Busy state used while the create pin request is in progress. */
  busyState: BusyState = new BusyState();

  /** Coordinates selected for the new catch pin. */
  selectedCoords: Coords | null = null;

  /** Available visibility options loaded from the backend. */
  visibilityOptions: EnumDTO[] = [];

  /** Available species options loaded from the backend. */
  speciesOptions: EnumDTO[] = [];

  /** Available bait options loaded from the backend. */
  baitOptions: EnumDTO[] = [];

  /** Selected image file for the new catch pin. */
  image: File | null = null;

  /** Error message displayed when validation or submission fails. */
  errorMessage: string = '';

  /** Groups available to the current user for restricted visibility selection. */
  userGroups = signal<GetUserGroupsResDTO['groups']>([]);

  /** Identifiers of the currently selected groups. */
  selectedGroupIds = signal<number[]>([]);

  /**
   * Reactive form used to validate catch pin input data.
   */
  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(BodyLengthConstraints.MIN), Validators.maxLength(BodyLengthConstraints.MAX)]],
    visibility: [0],
    species: [0],
    bait: [0],
    hook: ['', [Validators.maxLength(5)]],
    imageUrl: ['', [Validators.required, Validators.pattern(/^.*\.(png|jpeg|jpg)$/i)]],
    groupIds: this.fb.control<number[]>([])
  });

  /**
   * Loads form options, restores selected coordinates from the URL,
   * fetches the user's groups, and reacts to visibility changes.
   */
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

      if (lng === null || lat === null) return;

      if (!this.urlService.isLngLatValid(lng, lat)) {
        this.selectedCoords = null;
        return;
      }

      this.selectedCoords = {
        longitude: lng,
        latitude: lat
      };
    });

    // Se houver tempo alterar para colocar quando os groups forem selecionados, para evitar chamadas desnecessárias
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

  /**
   * Toggles a group identifier in the selected group list.
   *
   * @param groupId Identifier of the group to add or remove
   */
  toggleGroup(groupId: number) {
    const current = this.selectedGroupIds();

    const updated = current.includes(groupId)
      ? current.filter(id => id !== groupId)
      : [...current, groupId];

    this.selectedGroupIds.set(updated);
    this.form.controls.groupIds.setValue(updated);
  }

  /**
   * Handles image file selection and validates the selected file type.
   *
   * @param event File input change event
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG or JPEG or JPG images are allowed');
      this.form.patchValue({ imageUrl: null });
      this.image = null;
      return;
    }

    this.errorMessage = '';
    this.image = file;
    this.form.patchValue({ imageUrl: file.name });
  }

  /**
   * Cancels catch pin creation and navigates back to the map view.
   */
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

  /**
   * Validates the form, builds the request payload, and submits
   * the catch pin creation request to the backend.
   */
  onPublish(): void {
  this.form.markAllAsTouched();
  this.errorMessage = '';

  if (this.form.invalid) {
    this.errorMessage = 'Please correct the highlighted fields.';
    return;
  }

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
