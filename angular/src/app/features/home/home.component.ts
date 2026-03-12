import { Component } from '@angular/core';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/features/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [ FlatHeaderComponent, FooterComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
