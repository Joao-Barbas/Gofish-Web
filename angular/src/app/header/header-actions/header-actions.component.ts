// header-actions.component.ts
import { Component, inject, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@gofish/shared/services/auth.service';

type DropdownType = 'search' | 'user' | 'admin' | null;

@Component({
  selector: 'app-header-actions',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css'
})
export class HeaderActionsComponent {
  private authService = inject(AuthService);

  @Input() variant: 'flat' | 'flyout' = 'flat';

  activeDropdown: DropdownType = null;
  searchQuery = '';

  get isAdmin(): boolean {
    return true;//this.authService.isAdmin();
  }

  get isSignedIn(): boolean {
    return this.authService.isSignedIn();
  }

  toggleDropdown(dropdown: DropdownType) {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Emit search event or navigate
      console.log('Search:', this.searchQuery);
      this.closeDropdown();
    }
  }

  signOut() {
    //this.authService.signOut();
    this.closeDropdown();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdown();
  }
}
