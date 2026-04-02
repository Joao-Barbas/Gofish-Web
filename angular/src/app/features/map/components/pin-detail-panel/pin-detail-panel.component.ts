import { AsyncPipe, CommonModule, NgLocaleLocalization, NumberSymbol, SlicePipe } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output, resource, signal } from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { GeoLocationDTO, PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PinService } from '@gofish/shared/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { ReturnStatement } from '@angular/compiler';
import { EnumComponent } from "@gofish/shared/components/enum/enum.component";
import { Path } from '@gofish/shared/constants';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { VoteKind } from '@gofish/shared/enums/vote-kind.enum';

// Novos imports
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";

@Component({
  selector: 'app-pin-detail-panel',
  imports: [
    CommonModule,
    TimeAgoPipe,
    EnumComponent,
    RouterLink,
    SlicePipe,
    LoadingSpinnerComponent,
    UserTitleComponent
  ],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly avatarService = inject(AvatarService);
  readonly userProfileApi = inject(UserProfileApi); // API para o Rank

  readonly VoteKind = VoteKind;
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  readonly popupController = new PopupController('cluster-preview');
  pinData = input<PinDto | null>(null);
  public pinKind = PinKind;
  readonly Path = Path;
  @Output() cancel = new EventEmitter<void>();
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  // Resource para carregar o autor e obter o rank
  authorResource = resource({
    params: () => this.pinData()?.author?.id,
    loader: ({ params: id }) => {
      if (!id) return Promise.reject('No author ID');
      return firstValueFrom(this.userProfileApi.getUserProfile(id));
    }
  });

  // Computed para facilitar o uso no HTML (Loading / Error / Value)
  resources = computed(() => {
    const res = this.authorResource;
    return {
      isLoading: res.isLoading(),
      error: res.error(),
      hasValue: res.hasValue(),
      profile: res.value()
    };
  });

  // Vote
  currentVote = signal<number | null>(null);
  score = signal<number | null>(null);
  isVoting = signal<boolean>(false);

  ngOnInit() {
    const post = this.pinData()?.stats;
    if(!post) return;

    this.score.set(post.score ?? 1000);
    this.currentVote.set(post.currentUserVote ?? null);
  }

  vote(value: VoteKind.Upvote | VoteKind.Downvote) {
    if (this.isVoting()) return;

    const pinId = this.pinData()?.id;
    if (!pinId) return;

    const current = this.currentVote();
    this.isVoting.set(true);

    if (current === value) {
      this.pinService.deleteVote(pinId).subscribe({
        next: (res) => {
          this.score.set(res.newScore);
          this.currentVote.set(res.userVote ?? null);
          this.isVoting.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isVoting.set(false);
        }
      });
      return;
    }

    this.pinService.putVote(pinId, { value }).subscribe({
      next: (res) => {
        this.score.set(res.newScore);
        this.currentVote.set(res.userVote ?? null);
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
  }

  openGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.pinData()?.geolocation?.latitude},${this.pinData()?.geolocation?.longitude}`;
    window.open(url, '_blank');
  }

  goToPost() {
    this.router.navigate(['/forum/post', this.pinData()?.id]);
    this.popupController.close();
  }

  report() {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'report-pin', id]);
   }
}
