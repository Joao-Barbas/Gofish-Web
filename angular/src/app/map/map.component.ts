import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styles: ``
})
export class MapComponent implements OnInit {
  public firstName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => this.firstName = res.firstName,
      error: (err: any) => console.log("Error while retrieving user profile:\n", err)
    })
  }

  onSignOut() {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }
}
