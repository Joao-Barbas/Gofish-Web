import { Component, inject, signal } from '@angular/core';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { Path, PathSegment } from '@gofish/shared/constants';
import { FormBuilder, Validators } from '@angular/forms';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { toast } from 'ngx-sonner';
import { GetUserGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";

@Component({
  selector: 'app-my-groups',
  imports: [RouterLink],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css',
})
export class MyGroupsComponent {
  protected readonly Path = Path;
  protected readonly PathSegment = PathSegment;
  private readonly groupsService = inject(GroupsService);
  groups = signal<GetUserGroupsResDTO | null>(null);

  ngOnInit() {
    this.groupsService.getUserGroups().subscribe({
      next: (res) => {
        this.groups.set(res);
        console.log('groups', res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}
