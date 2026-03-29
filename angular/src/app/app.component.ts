import { filter, map } from 'rxjs';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent, HeaderKind } from "@gofish/features/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  title: string = 'angular';

  readonly data = toSignal(this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => { let r = this.route; while (r.firstChild) r = r.firstChild; return r; }),
    map((route) => route.snapshot.data))
  );

  readonly headerKind = computed(() => (this.data()?.['header'] as HeaderKind) ?? 'flat');
  // readonly header = computed(() => (this.data()?.['header'] as HeaderKind) ?? 'flat');
}
