import { computed, signal } from "@angular/core";

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export class LoadingState {
  private _status = signal<LoadingStatus>('idle');
  private _error  = signal<string | null>(null);

  readonly status = this._status.asReadonly();
  readonly error  = this._error.asReadonly();

  readonly isIdle = computed(() => this._status() === 'idle');
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly isSuccess = computed(() => this._status() === 'success');
  readonly isError = computed(() => this._status() === 'error');
  readonly isReady = computed(() => this._status() === 'success' || this._status() === 'error');

  start(): void {
    this._status.set('loading');
    this._error.set(null);
  }

  success(): void {
    this._status.set('success');
  }

  fail(error: string = 'Something went wrong'): void {
    this._status.set('error');
    this._error.set(error);
  }

  reset(): void {
    this._status.set('idle');
    this._error.set(null);
  }
}
