import { Component, inject } from '@angular/core';
import { resetConsumerBeforeComputation } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { toast } from 'ngx-sonner';
import { reportUnhandledError } from 'rxjs/internal/util/reportUnhandledError';

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
  private pinId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    };

    this.pinId = Number(id);
  }

  cancel() {
    this.router.navigate(['map']);
  }

  confirmDelete() {
    if (!this.pinId) return;
    this.pinService.deletePin(this.pinId).subscribe({
      next: () => {
        toast.success('deleted pin succesfully');
      }, error: (err) => {
        alert('You dont have permissions do delete this pin');
      }
    });
    this.router.navigate(['map']);
    this.popupService.close();
  }

}
