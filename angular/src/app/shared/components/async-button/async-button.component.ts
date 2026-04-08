import { Component, computed, input } from '@angular/core';

enum StateIndex { idle, busy, success }

export type AsyncButtonState = 'idle' | 'busy' | 'success';
export type AsyncButtonType  = 'button' | 'submit';

@Component({
  selector: 'app-async-button',
  imports: [],
  templateUrl: './async-button.component.html',
  styleUrl: './async-button.component.css',
})
export class AsyncButtonComponent {
  type   = input<AsyncButtonType>('submit');
  labels = input<string | [string, string?, string?]>(['Submit']);
  state  = input<AsyncButtonState>('idle');
  form   = input<string | null>(null);
  testId = input<string | null>(null);

  readonly label   = computed((l = this.labels()) => typeof l === 'string' ? l : l[StateIndex[this.state()]] ?? l[0]);
  readonly idle    = computed(() => this.state() === 'idle');
  readonly busy    = computed(() => this.state() === 'busy');
  readonly success = computed(() => this.state() === 'success');
}
