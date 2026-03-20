// signin-verify.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, Path } from '@gofish/shared/constants';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { TwoFactorSignInReqDTO } from '@gofish/shared/dtos/auth.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { NumbersOnlyDirective } from '@gofish/shared/directives/numbers-only.directive';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { LoadingState } from '@gofish/shared/core/loading-state';
import { AuthApi } from '@gofish/shared/api/auth.api';

@Component({
  selector: 'app-signin-verify',
  imports: [ReactiveFormsModule, RouterLink, NumbersOnlyDirective, AsyncButtonComponent],
  templateUrl: './signin-verify.component.html',
  styleUrl: './signin-verify.component.css',
})
export class SigninVerifyComponent implements OnInit {
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi     = inject(AuthApi);
  private readonly route       = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  readonly Path = Path;
  readonly Api  = Api;

  verifyForm: FormGroup = this.formBuilder.group({
    code: [ '', [
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ]]
  });

  apiProblems: ValidationProblemDetails | null = null;
  formErrors: ValidationErrors | null = this.verifyForm.errors;
  verifySuccess: boolean = false;
  twoFactorToken: string = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([Path.MAP]);
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate([Path.SIGN_IN]);
      return;
    }

    this.twoFactorToken = token;
  }

  private controlError(name: string): ValidationErrors | null {
    let control = this.verifyForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  getError(): string | null {
    const e = (field: string) => this.controlError(field);
    const g = this.verifyForm.errors;
    const s = this.apiProblems;
    // Field-level
    if (e('code')?.['required']) return 'Enter a code provided by your authenticator app.';
    // Api errors
    return s?.detail ?? null;
  }

  onSubmit(): void {
    this.verifyForm.markAllAsTouched();
    this.apiProblems = null;
    if (this.verifyForm.invalid) return;
    this.busyState.setBusy(true);
    this.verifySuccess = false;

    const dto: TwoFactorSignInReqDTO = {
      twoFactorToken: this.twoFactorToken,
      twoFactorCode:  this.verifyForm.value.code,
    };

    this.authApi.twoFactorSignIn(dto).subscribe({
      next: (res) => {
        this.busyState.setBusy(false);
        this.verifySuccess = true;
        setTimeout(() => {
          this.authService.insertToken(res.token);
          this.router.navigate([Path.MAP]);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? problem.status === 401 ? 'Incorrect code.' : 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    });
  }
}
