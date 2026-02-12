import { Component } from '@angular/core';
import { FlatHeaderComponent } from '@gofish/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [ FlatHeaderComponent, FooterComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

}
