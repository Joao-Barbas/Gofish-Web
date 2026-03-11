import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { BusyState } from '@gofish/shared/core/busy-state';

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
  values: UrlQuery | null = null;
  busyState: BusyState = new BusyState();

  selectedCoords = signal<Coords | null>(null);

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
      this.values = this.urlService.getUrlValues(paramMap);

      if (this.values === null) {
        this.selectedCoords.set(null);
        return;
      }

      const lng = Number(this.values.sLng);
      const lat = Number(this.values.sLat);

      if (!this.urlService.isLngLatValid(lng, lat)) {
        this.selectedCoords.set(null);
        return;
      }

      this.selectedCoords.set({
        longitude: lng,
        latitude: lat
      });

    });
  }

  onCancel(): void {
    this.router.navigate(['/map'], {
      queryParams: {
        vLat: this.selectedCoords()?.latitude,
        vLng: this.selectedCoords()?.longitude,
        z: this.values?.z,
      }
    });
  }

  onPublish(): void {
    if (this.selectedCoords() as Coords) {
      this.errorMessage = 'No valid coords';
      return;
    }

    if (this.form.invalid) return;

    this.errorMessage = '';
    this.busyState.setBusy(true);

    const dto: CreateWarnPinReqDTO = {
      latitude: this.selectedCoords()!.latitude,
      longitude: this.selectedCoords()!.longitude,
      visibility: this.form.value.visibility!,
      body: this.form.value.body ?? '',
      warningKind: this.form.value.warningKind!
    };

    this.isSubmitting = true;
    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createWarnPin(dto).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Warn Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create warn pin. Please try again.';
        toast.error(this.errorMessage);
      }
    });
  }
}
