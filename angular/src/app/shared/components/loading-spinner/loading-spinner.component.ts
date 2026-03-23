import { Component } from '@angular/core';

@Component({
  selector: 'gf-loading-spinner',
  host: { class: 'gf-flow-vertical gf-center-axes' },
  template: `
    <svg animate.enter="spinner-enter" xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
      <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
      <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
      <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
    </svg>
    <span>Loading...</span>
  `,
  styles: `
    :host {
      gap: var(--gf-6);
      padding: var(--gf-32);
      color: var(--dark-text-muted);
      font-size: var(--gf-14);
    }

    svg {
      width: 32px;
      height: 32px;
      animation: gf-basic-spin 1.5s linear infinite;

      &.spinner-enter {
        animation: gf-icon-scale-in .2s ease-out;
      }
    }

    span {
      font-size: var(--gf-text-sm);
    }
  `,
})
export class LoadingSpinnerComponent { }
