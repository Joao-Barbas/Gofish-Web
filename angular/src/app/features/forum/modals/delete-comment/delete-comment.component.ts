import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-delete-comment',
  imports: [],
  templateUrl: './delete-comment.component.html',
  styleUrl: './delete-comment.component.css',
})
export class DeleteCommentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  private commentId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    };

    this.commentId = Number(id);
  }

  cancel() {
    this.router.navigate(['forum']);
  }

  confirmDelete() {
    if (!this.commentId) return;
    this.pinService.deleteComment(this.commentId).subscribe({
      next: () => {
        toast.success('Deleted comment succesfully');
      }, error: (err) => {
        alert('You dont have permissions to delete this comment');
      }
    });
    this.router.navigate(['forum']);

  }
}
