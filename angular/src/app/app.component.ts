// app.component.ts

import { filter, map } from 'rxjs';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent, HeaderVariant } from "@gofish/features/header/header.component";
import { FooterVariant, FooterComponent } from '@gofish/features/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  title: string = 'angular';

  readonly data = toSignal(this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => {
      let r: ActivatedRoute = this.route;
      let m: Data = {};
      while (r.firstChild) r = r.firstChild;
      for (const seg of r.pathFromRoot) m = { ...m, ...seg.snapshot.data };
      return m;
    })
  ));

  readonly headerVariant = computed(() => (this.data()?.['header'] as HeaderVariant) ?? 'none');
  readonly footerVariant = computed(() => (this.data()?.['footer'] as FooterVariant) ?? 'none');
}
