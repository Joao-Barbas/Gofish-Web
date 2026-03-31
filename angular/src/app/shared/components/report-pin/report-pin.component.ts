import { Component, inject } from '@angular/core';
import { AsyncButtonComponent } from "../async-button/async-button.component";
import { CreatePinReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BusyState } from '@gofish/shared/core/busy-state';
import { PinReportReason, PinReportReasonLabel } from '@gofish/shared/enums/pin-report-reason.enum';
import { ReportService } from '@gofish/shared/services/report.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-report',
  imports: [AsyncButtonComponent, ReactiveFormsModule],
  templateUrl: './report-pin.component.html',
  styleUrl: './report-pin.component.css',
})
export class ReportPinComponent {
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  busyState: BusyState = new BusyState();
  errorMessage = '';
  pinId: number | null = null;

  readonly reportReasonOptions = Object.keys(PinReportReasonLabel)
    .filter(key => !isNaN(Number(key)))
    .map(key => {
      const val = Number(key) as PinReportReason;
      return {
        value: val,
        label: PinReportReasonLabel[val]
      };
    });
  form = this.fb.group({
    reason: [null as number | null, [Validators.required]],
    description: ['', [Validators.maxLength(200)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.pinId = Number(id);
    } else {
      this.errorMessage = "No Pin selected to report.";
      toast.error(this.errorMessage);
    }
  }

  onCancel(): void {
    // close modal and go back to previous page
    window.history.back();
  }

  onPublish(): void {
    if (this.form.invalid || !this.pinId) {
      this.form.markAllAsTouched();
      return;
    }

    this.busyState.setBusy(true);
    const toastId = toast.loading('Sending report...');

    const dto: CreatePinReportReqDTO = {
      pinId: this.pinId,
      reason: Number(this.form.value.reason),
      description: this.form.value.description ?? ''
    };

    this.reportService.createPinReport(dto).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Report sent. We will review it shortly.');
        this.onCancel();
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Failed to send report.';
        toast.error(this.errorMessage);
      }
    });
  }
}
