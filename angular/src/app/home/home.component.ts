import { Component } from '@angular/core';
import { HeaderComponent } from '@gofish/header/header.component';
import { FooterComponent } from '@gofish/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [ HeaderComponent, FooterComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

}
