import { Component } from '@angular/core';
import { FlatHeaderComponent } from '@gofish/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ FlatHeaderComponent, FooterComponent ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

}
