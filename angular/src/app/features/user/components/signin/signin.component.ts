import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    if (!this.authService.isSignedIn()) return;
    this.router.navigateByUrl('');
  }

  form: FormGroup = this.formBuilder.group({
    email: [ '', [ Validators.required ]],
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
        this.authService.storeToken(res.token!);
        this.router.navigateByUrl('/map');
      },
      error: (err: HttpErrorResponse) => {
        this.setBusy(false);
        this.isSubmitted = false;
        var res = err.error as SignInResDTO;
        this.formErrors.push(res.errorDescription ?? 'Server error. Try again later.');
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
