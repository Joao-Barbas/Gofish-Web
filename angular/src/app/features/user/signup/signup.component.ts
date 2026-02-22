// signup.component.ts

import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FirstKeyPipe } from '@gofish/shared/pipes/first-key.pipe';
import { AuthService } from '@gofish/shared/services/auth.service';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/signup.dto';

@Component({
  selector: 'app-signup',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink ],
  templateUrl: './signup.component.html',
  styles: ``
})
export class SignupComponent implements OnInit {
  isSubmitted: boolean = false;
  busyCount: number = 0;
  formErrors: string[] = [];

  constructor(
    public formBuilder: FormBuilder,
    public firstKey: FirstKeyPipe,
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    if (!this.authService.isSignedIn()) return;
    this.router.navigateByUrl('');
  }

  passwordMatch: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value != confirmPassword.value) {
      confirmPassword.setErrors({ passwordmismatch: true })
      return null;
    }
    confirmPassword?.setErrors(null);
    return null;
  }

  form = this.formBuilder.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
    ]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userName: ['', Validators.required],
    confirmPassword: [''],
  }, {
    validators: this.passwordMatch
  });

  onSubmit() {
    this.isSubmitted = true;
    this.form.markAllAsTouched();
    this.formErrors = [];

    if (this.form.invalid) return;
    this.setBusy(true);

    this.authService.signUpUser(this.form.value as SignUpReqDTO).subscribe({
      next: (res: SignUpResDTO) => {
        this.setBusy(false);
        this.isSubmitted = false;
        if (!res.success) return;
        this.form.reset();
        this.router.navigateByUrl('');
      },
      error: (err: HttpErrorResponse) => {
        this.setBusy(false);
        this.isSubmitted = false;
        var res = err.error as SignUpResDTO;
        this.formErrors.push(res.errors?.[0]?.description ?? 'Server error. Try again later.');
      }
    })
  }

  hasError(): boolean {
    return (this.form.invalid && (this.isSubmitted || this.form.touched || this.form.dirty)) || this.formErrors.length > 0;
  }

  getControlError(name: string): ValidationErrors | null | undefined {
    var control = this.form.get(name);
    if (Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))) return control?.errors;
    return null;
  }

  getError(): string | null {
    if (this.formErrors.length > 0) return this.formErrors[0];
    switch (this.firstKey.transform(this.getControlError('email'))) {
      case 'required': return 'Email is required';
      case 'email': return 'Enter a valid e-mail address';
    }
    switch (this.firstKey.transform(this.getControlError('firstName'))) {
      case 'required': return 'First name is required';
    }
    switch (this.firstKey.transform(this.getControlError('lastName'))) {
      case 'required': return 'Last name is required';
    }
    switch (this.firstKey.transform(this.getControlError('userName'))) {
      case 'required': return 'Unique user name is required';
    }
    switch (this.firstKey.transform(this.getControlError('password'))) {
      case 'required': return 'Password is required';
      case 'minlength': return 'Password needs atleast 6 characters';
      case 'pattern': return 'Password required one or more special character(s)';
    }
    switch (this.firstKey.transform(this.getControlError('confirmPassword'))) {
      case 'passwordmismatch': return 'Password\'s don\'t match';
    }
    return null;
  }

  setBusy(busy: boolean) {
    this.busyCount = busy ? this.busyCount + 1 : Math.max(0, this.busyCount - 1);
  }

  isBusy(): boolean {
    return this.busyCount > 0;
  }
}
