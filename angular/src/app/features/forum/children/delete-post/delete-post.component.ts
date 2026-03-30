import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-delete-post',
  imports: [],
  templateUrl: './delete-post.component.html',
  styleUrl: './delete-post.component.css',
})
export class DeletePostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private postId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    };

    this.postId = Number(id);
  }

  cancel() {
    this.router.navigate(['forum']);
  }

  confirmDelete() {
    if (!this.postId) return;
    this.pinService.deletePin(this.postId).subscribe({
      next: () => {
        toast.success('Deleted post succesfully');
      }, error: (err) => {
        alert('You dont have permissions do delete this post');
      }
    });
    this.router.navigate(['forum']);

  }
}
