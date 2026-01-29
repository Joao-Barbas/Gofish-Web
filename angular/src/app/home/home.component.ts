import { Component } from '@angular/core';
import { HeaderComponent } from "@gofish/header/header.component";

@Component({
  selector: 'app-home',
  imports: [ HeaderComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['../../styles.css', './home.component.css']
})
export class HomeComponent {

}
