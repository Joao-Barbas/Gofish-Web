import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { CreateInfoPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-pin-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-pin-modal.component.html',
  styleUrl: './info-pin-modal.component.css',
})
export class InfoPinModalComponent implements OnInit {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly urlService = inject(UrlService);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    visibility: [0, [Validators.required]],
    acccessDifficulty: [0, [Validators.required]],
    seaBed: [0, [Validators.required]]
  });

  coords: Coords | null = null;

  body: string = '';

  visibilityOptions: EnumDTO[] = [];
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];

  selectedVisibility: number = 0;
  selectedAccessDifficulty: number = 0;
  selectedSeaBed: number = 0;

  errorMessage: string = '';
  isSubmitting: boolean = false;


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
      const values = this.urlService.getUrlValues(queryParamMap);

      if (!values) return;

      this.coords = {
        longitude: values.lng!,
        latitude: values.lat!
      }
    });

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
    this.errorMessage = '';

    if (!this.coords) {
      this.errorMessage = 'No coords';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateInfoPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
      visibility: this.form.value.visibility!,
      body: this.form.value.body,
      accessDifficulty: this.form.value.acccessDifficulty!,
      seaBedType: this.form.value.seaBed!
    };

    this.isSubmitting = true;
    const toastId = toast.loading('Publishing your pin!');

    this.pinService.createInfoPin(dto).subscribe({
      next: () => {
        toast.dismiss(toastId);
        this.isSubmitting = false;
        toast.success('Info Pin created successfully.');
        this.router.navigate(['/map']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create info pin. Please try again.';
        toast.dismiss(toastId);
        toast.error(this.errorMessage);
      }
    });
  }

}
