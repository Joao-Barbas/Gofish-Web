import { Component } from '@angular/core';
import { SignupComponent } from "./signup/signup.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [ RouterOutlet ],
  templateUrl: './user.component.html',
  styles: ``
})
export class UserComponent {

}
