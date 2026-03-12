import { Component, inject } from '@angular/core';
import { resetConsumerBeforeComputation } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
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
    console.log(this.pinId);
    this.pinService.DeletePin(this.pinId).subscribe({
      next: () => {

      }, error: (err) => {
        alert(err);
      }
    });
    this.router.navigate(['map']);
  }

}
