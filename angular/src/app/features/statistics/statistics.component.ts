import { Component } from '@angular/core';
import { FlatHeaderComponent } from "../header/flat-header/flat-header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-statistics',
  imports: [FlatHeaderComponent, FooterComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent {

}
