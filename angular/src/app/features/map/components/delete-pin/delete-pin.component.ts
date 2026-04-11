import { Component, inject } from '@angular/core';
import { resetConsumerBeforeComputation } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { toast } from 'ngx-sonner';
import { reportUnhandledError } from 'rxjs/internal/util/reportUnhandledError';

/**
 * Confirmation component used to delete an existing pin.
 *
 * Responsibilities:
 * - Retrieve the pin identifier from the route
 * - Allow the user to cancel the deletion flow
 * - Submit the delete request to the backend
 * - Close any active popup after confirmation
 */
@Component({
  selector: 'app-delete-pin',
  imports: [],
  templateUrl: './delete-pin.component.html',
  styleUrl: './delete-pin.component.css',
})
export class DeletePinComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private readonly popupService = inject(PopupService);

  /** Identifier of the pin selected for deletion. */
  private pinId: number | null = null;

  /**
   * Loads the pin identifier from the current route.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    }

    this.pinId = Number(id);
  }

  /**
   * Cancels the delete flow and navigates back to the map page.
   */
  cancel() {
    this.router.navigate(['map']);
  }

  /**
   * Sends the delete request for the selected pin.
   * Displays success or error feedback, navigates to the map page,
   * and closes the current popup.
   */
  confirmDelete() {
    if (!this.pinId) return;

    this.pinService.deletePin(this.pinId).subscribe({
      next: () => {
        toast.success('deleted pin succesfully');
      },
      error: (err) => {
        alert('You dont have permissions do delete this pin');
      }
    });

    this.router.navigate(['map']);
    this.popupService.close();
  }
}
