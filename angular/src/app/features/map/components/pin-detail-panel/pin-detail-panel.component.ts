import { AsyncPipe, CommonModule, NgLocaleLocalization, NumberSymbol } from '@angular/common';
import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { GeoLocationDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { ReturnStatement } from '@angular/compiler';
import { EnumComponent } from "@gofish/shared/components/enum/enum.component";
import { Path } from '@gofish/shared/constants';

@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, TimeAgoPipe, EnumComponent, RouterLink],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  readonly popupController = new PopupController('cluster-preview');
  pinData = input<PinDataResDTO | null>(null);
  public pinKind = PinKind;
  readonly Path = Path;
  @Output() cancel = new EventEmitter<void>();
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  // Vote
  currentVote = signal<number | null>(null);
  score = signal<number | null>(null);
  isVoting = signal<boolean>(false);

  ngOnInit() {
    const post = this.pinData()?.post;
    if(!post) return;

    this.score.set(post.score ?? 1000);
    this.currentVote.set(post.userVote ?? null);
  }

  vote(value: 1 | -1) {
    if (this.isVoting()) return;

    const postId = this.pinData()?.post?.id;
    if (!postId) return;

    this.isVoting.set(true);
    this.pinService.vote(postId, value).subscribe({
      next: (res) => {
        this.score.set(res.score);
        this.currentVote.set(this.currentVote() === value ? null : value);
        this.isVoting.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isVoting.set(false);
      }
    });
  }

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  deletePin(): void {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }

  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
    console.log("SIIIIIIIIIIIIIIIIIIIIIII");
  }

  openGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.pinData()?.geolocation?.latitude},${this.pinData()?.geolocation?.longitude}`;
    window.open(url, '_blank');
  }

  goToPost() {
    this.router.navigate(['/forum/post', this.pinData()?.post?.id]);
    this.popupController.close();
  }
}



