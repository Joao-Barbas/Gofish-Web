import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-groups',
  imports: [],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
    private route = inject(ActivatedRoute);

  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
  }
}
