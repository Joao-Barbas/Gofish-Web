import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-delete-group',
  imports: [],
  templateUrl: './delete-group.component.html',
  styleUrl: './delete-group.component.css',
})
export class DeleteGroupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupsService);
  private groupId: number | null = null;

  ngOnInit() {
    const id = this.route.parent?.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    };

    this.groupId = Number(id);
  }

  cancel() {
    this.router.navigate(['forum']);
  }

  confirmDelete() {
    if (!this.groupId) return;
    this.groupService.deleteGroup(this.groupId).subscribe({
      next: () => {
        toast.success('Deleted group succesfully');
      }, error: (err) => {
        alert('You dont have permissions to delete this group');
      }
    });
    this.router.navigate(['forum']);

  }
}
