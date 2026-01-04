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
    console.log('sent');

    this.authService.signInUser(this.form.value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.form.reset();
        this.isSubmitted = false;
        this.authService.storeToken(res.token);
        this.router.navigateByUrl('/map');
      },
      error: (err: any) => {
        // if (err.error.errors) {}
        console.log(err);
      }
    })
  }
}
