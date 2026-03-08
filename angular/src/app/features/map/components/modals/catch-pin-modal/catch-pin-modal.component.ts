import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-catch-pin-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catch-pin-modal.component.html',
  styleUrl: './catch-pin-modal.component.css'
})
export class CatchPinModalComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly urlService = inject(UrlService);
  private readonly route = inject(ActivatedRoute);

  coords: Coords | null = null;

  visibilityOptions: EnumDTO[] = [];
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];

  selectedVisibility!: number;
  selectedSpecies: number | null = null;
  selectedBait: number | null = null;
  hookSize: string = '';
  body: string = '';
  image: File | null = null;

  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    visibility: [0],
    species: [0],
    bait: [0],
    hook: [''],
    imageUrl: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
        this.selectedVisibility = this.visibilityOptions[0]?.value;
      }
    });

    this.pinService.enumerateSpeciesType().subscribe({
      next: (res: EnumDTO[]) => this.speciesOptions = res
    });

    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res
    });

    this.route.queryParamMap.subscribe(queryParamMap => {
      const values = this.urlService.getUrlValues(queryParamMap);

      if (!values) return;

      this.coords = {
        longitude: values.sLng!,
        latitude: values.sLat!
      }
    });
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
    this.router.navigate(['/map'], {
      queryParams: {
        lat: this.coords?.latitude,
        lng: this.coords?.longitude,
        z: this.route.snapshot.queryParamMap.get('z')
      }
    });
  }

  onPublish(): void {
    this.errorMessage = null;

    if (!this.coords) {
      this.errorMessage = 'No coords';
      return;
    }

    if (!this.image) {
      this.errorMessage = 'Please upload an image.';
      return;
    }

    const formData = new FormData();
    formData.append('Latitude', this.coords.latitude.toString());
    formData.append('Longitude', this.coords.longitude.toString());
    formData.append('Image', this.image);
    formData.append('body', this.form.value.body!);
    formData.append('image', this.image);
    formData.append('visibility', String(this.form.value.visibility));
    formData.append('species', String(this.form.value.species));
    formData.append('bait', String(this.form.value.bait));
    formData.append('hook', this.form.value.hook ?? '');

    this.isSubmitting = true;
    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createCatchPin(formData).subscribe({
      next: () => {
        toast.dismiss(toastId);
        this.isSubmitting = false;
        toast.success('Catch Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        toast.dismiss(toastId);
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create catch pin. Please try again.';
        toast.error(this.errorMessage);
      }
    });
  }
}
