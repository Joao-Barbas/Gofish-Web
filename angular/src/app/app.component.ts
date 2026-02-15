import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { PopupService } from '@gofish/shared/services/popup.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  public readonly popupService = inject(PopupService);
  public title = 'angular';
}
