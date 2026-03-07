import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouteReuseStrategy } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO} from '@gofish/shared/dtos/enum.dto';
import { CreateWarnPinReqDTO } from '@gofish/shared/dtos/pin.dto';
import { Coords } from '@gofish/shared/models/coords.model';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

@Component({
  selector: 'app-warn-pin-modal',
  imports: [CommonModule, ReactiveFormsModule,NgxSonnerToaster],
  templateUrl: './warn-pin-modal.component.html',
  styleUrl: './warn-pin-modal.component.css',
})
export class WarnPinModalComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private readonly fb = inject(FormBuilder);

  @Input() coords: Coords | null = null;

  body: string = '';

  warnTypeOptions: EnumDTO[] = [];
  visibilityOptions: EnumDTO[] = [];

  selectedVisibility?: number = 0;
  selectedWarnType?: number = 0;

  errorMessage = '';
  isSubmitting: boolean = false;

  form = this.fb.group({
    visibility: [0, Validators.required],
    body: [''],
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
  }

  onCancel(): void {
    this.router.navigate(['/map']);
  }

  onPublish(): void {
    this.errorMessage = '';

    if (!this.coords) {
      this.errorMessage = 'No coords';
      return;
    }

    const dto: CreateWarnPinReqDTO = {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
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
        this.router.navigate(['/map']);
      },
      error: () => {
        this.isSubmitting = false;
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create pin. Please try again.';
        toast.error(this.errorMessage);
      }
    });
  }


}
