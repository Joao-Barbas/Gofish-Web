import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink ],
  templateUrl: './signup.component.html',
  styles: ``
})
export class SignupComponent implements OnInit {
  private isSubmitted: boolean = false;
  public isBusy: boolean = false;
  private serverErrors: string[] = [];

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
  }, { validators: this.passwordMatch });

  onSubmit() {
    this.isSubmitted = true;
    this.form.markAllAsTouched();
    this.serverErrors = [];

    if (this.form.invalid) return;
    this.isBusy = true;

    this.authService.postUser(this.form.value).subscribe({
      next: (res: any) => {
        this.isBusy = false;
        if (res.succeeded) {
          this.form.reset();
          this.isSubmitted = false;
          this.serverErrors = [];
          this.router.navigateByUrl('');
        }
      },
      error: (err: any) => {
        this.isBusy = false;
        if (err.error.errors)
        {
          err.error.errors.forEach((e: any) => {
            switch (e.code) {
            case 'DuplicateEmail':
              this.serverErrors.push('E-mail is already in use');
              break;
            case 'DuplicateUserName':
              this.serverErrors.push('Username is already taken');
              break;
            default:
              this.serverErrors.push('Registration failed');
            }
          });
        } else {
          this.serverErrors.push('Server error. Try again later.')
        }
      }
    })
  }

  hasError(): boolean {
    return (this.form.invalid && (this.isSubmitted || this.form.touched || this.form.dirty)) || this.serverErrors.length > 0;
  }

  getControlError(name: string): ValidationErrors | null | undefined {
    var control = this.form.get(name);
    if (Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty)))
      return control?.errors;
    return null;
  }

  getError(): string | null {
    if (this.serverErrors.length > 0) return this.serverErrors[0];

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
}
