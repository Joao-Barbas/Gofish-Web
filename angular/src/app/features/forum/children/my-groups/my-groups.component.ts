import { Component, inject } from '@angular/core';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { Path } from '@gofish/shared/constants';
import { FormBuilder, Validators } from '@angular/forms';
import { PinService } from '@gofish/features/map/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-my-groups',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css',
})
export class MyGroupsComponent {
  protected readonly Path = Path;
  private readonly groupsService = inject(GroupsService);

  ngOninit() {
    
  }
}
