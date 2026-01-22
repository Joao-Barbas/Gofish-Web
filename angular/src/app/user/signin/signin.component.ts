import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-signin',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink ],
  templateUrl: './signin.component.html',
  styles: ``
})
export class SigninComponent implements OnInit {
  private formErrors: string[] = [];
  private busyCount: number = 0;
  private isSubmitted: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit() {
    if (!this.authService.isSignedIn()) return;
    this.router.navigateByUrl('');
  }

  form = this.formBuilder.group({
    email: [ '', [ Validators.required ]],
    password: [ '', [ Validators.required ]],
  });

  onSubmit() {
    this.isSubmitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
    this.setBusy(true);

    this.authService.signInUser(this.form.value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.setBusy(false);
        this.form.reset();
        this.isSubmitted = false;
        this.authService.storeToken(res.token);
        this.router.navigateByUrl('/map');
      },
      error: (err: any) => {
        this.setBusy(false);
        if (err.error) {
          switch (err.error.message)
          {
          case "NoSuchUser": this.formErrors.push('Email and/or password are incorrect'); break;
          case "InvalidCredentials": this.formErrors.push('Email and/or password are incorrect'); break;
          }
        }
        console.log(err.error.message)
      }
    })
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
