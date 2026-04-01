// search.component.ts

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'gf-search',
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private readonly router = inject(Router);
  readonly query = signal('');
  search(category: 'users' | 'groups') {
    this.router.navigate(['/search', category], { // TODO: Use constants
      queryParams: { query: this.query() }
    });
  }
}
