import { Component } from '@angular/core';
import { HeaderComponent } from '@gofish/header/header.component';
import { FooterComponent } from '@gofish/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ HeaderComponent, FooterComponent ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

}
