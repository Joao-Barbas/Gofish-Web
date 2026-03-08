import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

@Component({
  selector: 'app-warn-pin-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './warn-pin-modal.component.html',
  styleUrl: './warn-pin-modal.component.css',
})
export class WarnPinModalComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private readonly fb = inject(FormBuilder);
  private readonly urlService = inject(UrlService);
  private readonly route = inject(ActivatedRoute);


  coordsUrl: Coords | null = null;

  warnTypeOptions: EnumDTO[] = [];
  visibilityOptions: EnumDTO[] = [];

  errorMessage = '';
  isSubmitting = false;

  form = this.fb.group({
    visibility: [0, Validators.required],
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    warningKind: [0, Validators.required]
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
      const values = this.urlService.getUrlValues(paramMap);

      if (values === null) {
        this.coordsUrl = null;
        return;
      }

      const lng = Number(values.sLng);
      const lat = Number(values.sLat);
      console.log(lng,lat);
      if (!this.urlService.isLngLatValid(lng, lat)) {
        this.coordsUrl = null;
        return;
      }

      this.coordsUrl = {
        longitude: lng,
        latitude: lat
      };
      console.log("aqui"+this.coordsUrl);
    });
  }

  onCancel(): void {
    this.router.navigate(['/map'], {
      queryParams: {
        vLat: this.coordsUrl?.latitude,
        vLng: this.coordsUrl?.longitude,
        z: this.route.snapshot.queryParamMap.get('z'),
      }
    });
  }

  onPublish(): void {
    this.errorMessage = '';

    if (!this.coordsUrl) {
      this.errorMessage = 'No coords';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateWarnPinReqDTO = {
      latitude: this.coordsUrl.latitude,
      longitude: this.coordsUrl.longitude,
      visibility: this.form.value.visibility!,
      body: this.form.value.body ?? '',
      warningKind: this.form.value.warningKind!
    };

    this.isSubmitting = true;
    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createWarnPin(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        toast.dismiss(toastId);
        toast.success('Warn Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        this.isSubmitting = false;
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create warn pin. Please try again.';
        toast.error(this.errorMessage);
      }
    });
  }
}
