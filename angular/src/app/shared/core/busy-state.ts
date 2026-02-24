// busy-state.ts

import { signal, computed } from '@angular/core';

export class BusyState {
  private _count = signal<number>(0);
  readonly count = this._count.asReadonly();

  readonly busy = computed(() => this._count() > 0);
  readonly idle = computed(() => this._count() < 1);

  readonly isBusy = this.busy;
  readonly isIdle = this.idle;

  private decBusy = (): void => this._count.update(count => Math.max(0, count - 1));
  private incBusy = (): void => this._count.update(count => count + 1);

  setBusy(busy: boolean): void {
    busy ? this.incBusy()
         : this.decBusy();
  }

  beginBusy(): () => void {
    this.incBusy();
    return () => this.decBusy();
  }
}
