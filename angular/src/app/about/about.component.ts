import { Component } from '@angular/core';
import { HeaderComponent } from '@gofish/header/header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ HeaderComponent ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

}
