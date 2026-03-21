// async-button-2.component.ts

import { Component, computed, input } from '@angular/core';

export type AsyncButtonState = 'idle' | 'busy' | 'success';
export type AsyncButtonConfig<T> = { idle?: T; busy?: T; success?: T; }

/**
 * A button that reflects asynchronous operation state (idle → busy → success).
 *
 * The parent supplies an `AsyncButtonConfig<boolean>` to `[states]` with
 * boolean flags for `busy` and/or `success`. The component resolves the
 * active state by checking in **priority order** (success → busy → idle),
 * where the first truthy value wins. If none are truthy, the state
 * defaults to `idle`.
 *
 * Labels are provided via a matching `AsyncButtonConfig<string>` object.
 * The component picks the label corresponding to the resolved state,
 * falling back to `'Submit'` if no match is found.
 *
 * @example
 * ```html
 * <gf-async-button
 *   [labels]="{ idle: 'Save', busy: 'Saving…', success: 'Saved!' }"
 *   [states]="{ busy: isSaving(), success: isSaved() }"
 * ></gf-async-button>
 * ```
 */
@Component({
  selector: 'gf-async-button',
  templateUrl: './async-button-2.component.html',
  styleUrl: './async-button-2.component.css',
})
export class AsyncButtonComponent {
  labels = input<AsyncButtonConfig<string>>({ idle: 'Submit' });
  states = input<AsyncButtonConfig<boolean>>({ idle: true });

  type = input<string | null>(null);
  form = input<string | null>(null);

  readonly idle    = computed<boolean>(() => this.state() === 'idle');
  readonly busy    = computed<boolean>(() => this.state() === 'busy');
  readonly success = computed<boolean>(() => this.state() === 'success');

  readonly state = computed<AsyncButtonState>(() => {
    let s = this.states();
    if (s.success) return 'success';
    if (s.busy) return 'busy';
    if (s.idle) return 'idle';
    return 'idle';
  });

  readonly label = computed<string>(() => {
    return this.labels()[this.state()] ?? 'Submit';
  });
}
