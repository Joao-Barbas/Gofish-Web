// change-birthdate-modal.component.ts

import { Component, inject, output, signal, computed } from '@angular/core';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { FormsModule } from '@angular/forms';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-birthdate-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    AsyncButtonComponent,
    FormsModule
  ],
  templateUrl: './change-birthdate-modal.component.html',
  styleUrl: './change-birthdate-modal.component.css',
})
export class ChangeBirthdateModalComponent implements SimpleModal {
  static readonly Key = 'app-change-birthdate-modal';

  private readonly userApi = inject(UserApi);

  readonly modalController = new ModalController(ChangeBirthdateModalComponent.Key);
  readonly busyState       = new BusyState();

  negative = output<void>();
  positive = output<string>();

  error   = signal<string | null>(null);
  success = signal<boolean>(false);

  selectedDay   = signal<number | null>(null);
  selectedMonth = signal<number | null>(null);
  selectedYear  = signal<number | null>(null);

  readonly currentYear = new Date().getFullYear();
  readonly minYear = this.currentYear - 100;
  readonly maxYear = this.currentYear - 13;

  readonly years = Array.from({ length: this.maxYear - this.minYear + 1 }, (_, i) => this.maxYear - i);

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly daysInMonth = computed(() => {
    const month = this.selectedMonth();
    const year = this.selectedYear();
    if (!month || !year) return 31;
    return new Date(year, month, 0).getDate();
  });

  readonly days = computed(() =>
    Array.from({ length: this.daysInMonth() }, (_, i) => i + 1)
  );

  onPositive(): void {
    const day = this.selectedDay();
    const month = this.selectedMonth();
    const year = this.selectedYear();

    if (!day || !month || !year) {
      this.error.set('Please select day, month and year');
      return;
    }

    // Clamp day if it exceeds days in selected month
    const maxDay = this.daysInMonth();
    const clampedDay = Math.min(day, maxDay);

    const date = new Date(Date.UTC(year, month - 1, clampedDay));
    const isoString = date.toISOString();

    this.success.set(false);
    this.busyState.setBusy(true);
    this.userApi.patchUser({
      birthDate: isoString
    }).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.success.set(true);
        this.positive.emit(isoString);
        setTimeout(() => {
          this.success.set(false);
          this.modalController.close();
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        this.error.set(problem.detail ?? 'Server Error. Try again later.')
      },
    });
  }

  onNegative(): void {
    this.modalController.close();
    this.negative.emit();
  }
}
