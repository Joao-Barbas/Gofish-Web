// profile.component.ts

import { RouterLink } from '@angular/router';
import { AfterViewInit, Component, ElementRef, effect, signal, viewChild } from '@angular/core';
import { FlatHeaderComponent } from "@gofish/features/header/flat-header/flat-header.component";
import { FooterComponent } from "@gofish/features/footer/footer.component";
import { Path, PathSegment } from '@gofish/shared/constants';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { FriendCardComponent } from "./components/friend-card/friend-card.component";
import { GroupCardComponent } from '@gofish/features/user/profile/pages/index/components/group-card/group-card.component';

@Component({
  selector: 'app-profile',
  imports: [FlatHeaderComponent, FooterComponent, RouterLink, AsyncButtonComponent, FriendCardComponent, GroupCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements AfterViewInit {
  public bioTextRef   = viewChild<ElementRef>('bioText');
  public bioToggleRef = viewChild<ElementRef>('bioToggle');

  public bioCollapsed = signal(true);
  public bioOverflows = signal(false);

  public Path        = Path;
  public PathSegment = PathSegment;

  ngAfterViewInit() {
    let e = this.bioTextRef()?.nativeElement;
    if (e) this.bioOverflows.set(e.scrollHeight > e.clientHeight);
  }
}
