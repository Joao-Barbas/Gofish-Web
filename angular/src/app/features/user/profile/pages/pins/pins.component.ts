// pins.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@gofish/features/footer/footer.component';
import { FlatHeaderComponent } from '@gofish/features/header/flat-header/flat-header.component';
import { FriendsListComponent } from '@gofish/features/user/profile/pages/friends/components/friends-list/friends-list.component';
import { RequestsListComponent } from '@gofish/features/user/profile/pages/friends/components/requests-list/requests-list.component';
import { PinCardComponent } from '@gofish/features/user/profile/pages/pins/components/pin-card/pin-card.component';
import { map } from 'rxjs';

type PinKind = 'catch' | 'information' | 'warning'; // TODO: Isnt this on a .model.ts?

interface Pin {
  id: string;
  kind: PinKind;
  title: string;
  // ...
}

@Component({
  selector: 'app-pins',
  imports: [
    RouterLink,
    FlatHeaderComponent,
    FriendsListComponent,
    RequestsListComponent,
    PinCardComponent,
    FooterComponent
  ],
  templateUrl: './pins.component.html',
  styleUrl: './pins.component.css',
})
export class PinsComponent {
  private route = inject(ActivatedRoute);

  public activeTab = toSignal(
    this.route.queryParams.pipe(map(p => p['filter'] ?? 'all')),
    { initialValue: 'all' }
  );

  allPins = signal<Pin[]>([]);

  filteredPins = computed(() => {
    const tab = this.activeTab();
    const pins = this.allPins();

    if (tab === 'all') return pins;
    return pins.filter(pin => pin.kind === tab);
  });

  counts = computed(() => ({
    all: this.allPins().length,
    catch: this.allPins().filter(p => p.kind === 'catch').length,
    information: this.allPins().filter(p => p.kind === 'information').length,
    warning: this.allPins().filter(p => p.kind === 'warning').length,
  }));
}
