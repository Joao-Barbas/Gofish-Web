// signup.component.ts

import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FirstKeyPipe } from '@gofish/shared/pipes/first-key.pipe';
import { AuthService } from '@gofish/shared/services/auth.service';
import { Api, Path } from '@gofish/shared/constants';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { RegexMatchesPipe } from '@gofish/shared/pipes/regex-matches.pipe';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { BusyState } from '@gofish/shared/core/busy-state';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { LettersOnlyDirective } from '@gofish/shared/directives/letters-only.directive';
import { AuthApi } from '@gofish/shared/api/auth.api';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/auth.dto';

@Component({
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    RegexMatchesPipe,
    AsyncButtonComponent,
    LettersOnlyDirective
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi     = inject(AuthApi);

  readonly formBuilder = inject(FormBuilder);
  readonly firstKey    = inject(FirstKeyPipe);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  readonly Path = Path;
  readonly Api  = Api;

  signUpForm = this.formBuilder.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      (control: AbstractControl) => this.passwordStrong(control)
    ]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userName: ['', Validators.required],
    confirmPassword: [''],
  }, { validators: [
    (control: AbstractControl) => this.passwordMatch(control),
    (control: AbstractControl) => this.passwordNotEmail(control)
  ]});

  apiProblems: ValidationProblemDetails | null = null;
  formErrors: ValidationErrors | null = this.signUpForm.errors;
  signUpSuccess: boolean = false;
  showPwd: boolean = false;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;
    this.router.navigate([Path.HOME]);
  }

  // Form errors/validations

  private passwordNotEmail(control: AbstractControl): ValidationErrors | null {
    let email = control.get('email')?.value;
    let password = control.get('password')?.value;
    if (password && email && password === email) return { 'passwordnotemail': true };
    return null;
  }

  private passwordMatch(control: AbstractControl): ValidationErrors | null {
    let password = control.get('password')?.value;
    let confirm = control.get('confirmPassword')?.value;
    if (password && password != confirm) return { 'passwordmismatch': true };
    return null;
  }

  private passwordStrong(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const errors: ValidationErrors = {};

    if (!/\d/.test(value)) errors['nonumber'] = true;
    if (!/[A-Z]/.test(value)) errors['nouppercase'] = true;
    if (!/[^a-zA-Z0-9 ]/.test(value)) errors['nospecial'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  private controlError(name: string): ValidationErrors | null {
    let control = this.signUpForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  getError(): string | null {
    const e = (field: string) => this.controlError(field);
    const g = this.signUpForm.errors;
    const s = this.apiProblems;
    // Field-level
    if (e('email')?.['required']) return 'Email is required.';
    if (e('email')?.['email']) return 'Enter a valid e-mail address.';
    if (e('firstName')?.['required']) return 'First name is required.';
    if (e('lastName')?.['required']) return 'Last name is required.';
    if (e('userName')?.['required']) return 'Unique user name is required.';
    if (e('password')?.['required']) return 'Password is required.';
    if (e('password')?.['minlength']) return 'Password needs atleast six characters.';
    if (e('password')?.['nonumber']) return 'Password needs at least one number.';
    if (e('password')?.['nouppercase']) return 'Passowrd needs at least one uppercase character.';
    if (e('password')?.['nospecial']) return 'Password needs one or more special character(s).';
    // Group-level
    if (g?.['passwordmismatch']) return 'Password\'s don\'t match.';
    if (g?.['passwordnotemail']) return 'Password can\'t be the same as email.';
    // Api errors
    return s?.detail ?? null;
  }

  // End form errors/validations

  onSubmit() {
    this.signUpForm.markAllAsTouched();
    this.apiProblems = null;
    if (this.signUpForm.invalid) return;
    this.busyState.setBusy(true);
    this.signUpSuccess = false;

    this.authApi.signUp(this.signUpForm.value as SignUpReqDTO).subscribe({
      next: (res: SignUpResDTO) => {
        this.busyState.setBusy(false);
        this.signUpSuccess = true;
        setTimeout(() => {
          this.signUpSuccess = false;
          this.signUpForm.reset();
          this.authService.insertToken(res.token!);
          this.router.navigate([Path.FORUM]);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    })
  }

  onGoogle() {
    window.location.href = Api.Auth.action('ExternalLogin?provider=Google');
  }
}
