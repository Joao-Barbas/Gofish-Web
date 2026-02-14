import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PopupComponent, PopupId } from '@gofish/shared/models/popup.model';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';

@Component({
  selector: 'app-popup-user',
  imports: [ CommonModule ],
  templateUrl: './popup-user.component.html',
  styleUrl: './popup-user.component.css'
})
export class PopupUserComponent implements PopupComponent {
  private routerLink = inject(Router);
  private popupService = inject(PopupService);
  private authService = inject(AuthService);

  public id: PopupId = "header-user";
  public isOpen$ = this.popupService.isOpen$(this.id);

  toggle() { this.popupService.toggle(this.id); console.log(this.isOpen$.subscribe((next) => console.log(next.valueOf().toString())))}
  open() { this.popupService.open(this.id); }
  close() { this.popupService.close(); }

  get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  goSignIn(): void {
    this.routerLink.navigateByUrl('/user/signin');
    this.close();
  }

  signOut() {
    this.authService.signOut();
    this.close();
  }

  signIn() {
    this.close()
  }
}
