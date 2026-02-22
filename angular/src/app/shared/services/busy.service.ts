// busy.service.ts

import { signal, computed } from '@angular/core';

export class BusyState { // Plain class for local component state
  private _busy = signal<number>(0);

  public readonly busy   = computed(() => this._busy() > 0);
  public readonly isBusy = this.busy; // Alias

  public setBusy(busy: boolean): void { busy ? this.incBusy() : this.decBusy(); }
  public beginBusy(): () => void { this.incBusy(); return () => this.decBusy(); }

  private incBusy = (): void => this._busy.update(count => count + 1);
  private decBusy = (): void => this._busy.update(count => Math.max(0, count - 1));
}
