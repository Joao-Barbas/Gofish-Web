import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BusyState } from '@gofish/shared/core/busy-state';
import { CreateCommentReportReqDTO } from '@gofish/shared/dtos/report.dto';
import { CommentReportReasonLabel, CommentReportReason } from '@gofish/shared/enums/comment-report-reason.enum';
import { ReportService } from '@gofish/shared/services/report.service';
import { toast } from 'ngx-sonner';
import { AsyncButtonComponent } from "../async-button/async-button.component";

@Component({
  selector: 'gf-report-comment',
  imports: [AsyncButtonComponent, ReactiveFormsModule],
  templateUrl: './report-comment.component.html',
  styleUrl: './report-comment.component.css',
})
export class ReportCommentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  busyState: BusyState = new BusyState();
  errorMessage = '';
  commentId: number | null = null;

  readonly reportReasonOptions = Object.keys(CommentReportReasonLabel)
    .filter(key => !isNaN(Number(key)))
    .map(key => {
      const val = Number(key) as CommentReportReason;
      return {
        value: val,
        label: CommentReportReasonLabel[val]
      };
    });

  form = this.fb.group({
    reason: [null as number | null, [Validators.required]],
    description: ['', [Validators.maxLength(200)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.commentId = Number(id);
    } else {
      this.errorMessage = "No comment selected to report.";
      toast.error(this.errorMessage);
    }
  }

  onCancel(): void {
    window.history.back();
  }

  onPublish(): void {
    if (this.form.invalid || !this.commentId) {
      this.form.markAllAsTouched();
      return;
    }

    this.busyState.setBusy(true);
    const toastId = toast.loading('Reporting comment...');

    const dto: CreateCommentReportReqDTO = {
      commentId: this.commentId,
      reason: Number(this.form.value.reason),
      description: this.form.value.description ?? ''
    };

    this.reportService.createCommentReport(dto).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Thank you for reporting. We will investigate.');
        this.onCancel();
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Failed to report comment.';
        toast.error(this.errorMessage);
      }
    });
  }
}
