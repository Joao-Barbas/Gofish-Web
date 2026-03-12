import { Component } from '@angular/core';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/features/footer/footer.component';

@Component({
  selector: 'app-terms-of-service',
  imports: [FlatHeaderComponent, FooterComponent],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.css',
})
export class TermsOfServiceComponent {
    scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
