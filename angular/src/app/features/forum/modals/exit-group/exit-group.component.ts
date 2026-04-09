import { Component, inject } from '@angular/core';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'gf-exit-group',
  imports: [],
  templateUrl: './exit-group.component.html',
  styleUrl: './exit-group.component.css',
})
export class ExitGroupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);
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
    this.groupsService.leaveGroup(this.groupId).subscribe({
      next: () => {
        toast.success('Left group succesfully');
      }, error: (err) => {
        toast.error('You dont have permissions to leave this group');
        console.log(err);
      }
    });
    this.router.navigate(['forum']);

  }
}
