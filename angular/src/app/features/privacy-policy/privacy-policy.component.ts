import { Component } from '@angular/core';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FooterComponent } from '@gofish/features/footer/footer.component';

@Component({
  selector: 'app-privacy-policy',
  imports: [FlatHeaderComponent, FooterComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css',
})
export class PrivacyPolicyComponent {
    scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngAfterViewInit() {
    window.scrollTo({ top: 0 });
  }
}
