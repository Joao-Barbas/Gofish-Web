import { Directive, HostListener, Input, Renderer2, inject, OnDestroy, computed } from '@angular/core';

@Directive({
  selector: '[gfTooltip]', // Este é o nome que vais usar no HTML
  standalone: true
})
export class MouseFollowDirective implements OnDestroy {
  @Input('gfTooltip') tooltipText = '';

  private tooltipEl: HTMLElement | null = null;
  private renderer = inject(Renderer2);

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipText) return;

    this.tooltipEl = this.renderer.createElement('div');

    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipEl, text);

    this.renderer.addClass(this.tooltipEl, 'gf-mouse-tooltip');

    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltipEl) {
      const x = event.clientX + 15;
      const y = event.clientY + 15;

      this.renderer.setStyle(this.tooltipEl, 'left', `${x}px`);
      this.renderer.setStyle(this.tooltipEl, 'top', `${y}px`);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.destroyTooltip();
  }

  ngOnDestroy() {
    this.destroyTooltip();
  }

  private destroyTooltip() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
