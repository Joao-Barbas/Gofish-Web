// signin.component.ts

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { getFirstError, ProblemDetails } from '@gofish/shared/core/problem-details';
import { SignInReqDTO, SignInResDTO } from '@gofish/shared/dtos/signin.dto';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-signin',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink ],
  templateUrl: './signin.component.html',
  styles: ``
})
export class SigninComponent implements OnInit {
  formErrors: string[] = [];
  busyCount: number = 0;
  isSubmitted: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) return;
    this.router.navigate([Path.HOME]);
  }

  form: FormGroup = this.formBuilder.group({
    emailOrUserName: [ '', [ Validators.required ]],
    password: [ '', [ Validators.required ]],
  });

  onSubmit() {
    this.isSubmitted = true;
    this.form.markAllAsTouched();
    this.formErrors = [];

    if (this.form.invalid) return;
    this.setBusy(true);

    this.authService.signInUser(this.form.value as SignInReqDTO).subscribe({
      next: (res: SignInResDTO) => {
        this.setBusy(false);
        this.isSubmitted = false;
        this.form.reset();
        this.authService.insertToken(res.token!); // TODO: This wont work if 2fa enabled
        this.router.navigate([Path.MAP]);
      },
      error: (err: HttpErrorResponse) => {
        this.setBusy(false);
        this.isSubmitted = false;
        let problem = err.error as ProblemDetails
        this.formErrors.push(getFirstError(problem) ?? 'Server error. Try again later');
      }
    });
  }

  hasError(): boolean {
    return this.formErrors.length > 0;
  }

  getError(): string | null {
    return this.hasError() ? this.formErrors[0] : null;
  }

  setBusy(busy: boolean) {
    this.busyCount = busy ? this.busyCount + 1 : Math.max(0, this.busyCount - 1);
  }

  isBusy(): boolean {
    return this.busyCount > 0;
  }
}
