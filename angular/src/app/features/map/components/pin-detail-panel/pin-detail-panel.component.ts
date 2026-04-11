import { AsyncPipe, CommonModule, NgLocaleLocalization, NumberSymbol } from '@angular/common';
import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
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

import { Path } from '@gofish/shared/constants';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { VoteKind } from '@gofish/shared/enums/vote-kind.enum';
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { EnumComponent } from '@gofish/shared/components/enum/enum.component';

/**
 * Displays detailed information for a selected pin and exposes
 * actions such as voting, reporting, deletion, navigation, and preview.
 *
 * Responsibilities:
 * - Render detailed pin information in the UI
 * - Track local vote and score state
 * - Allow the user to close the panel or preview coordinates
 * - Navigate to related flows such as delete, report, or forum post view
 */
@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, TimeAgoPipe, EnumComponent, RouterLink, UserTitleComponent],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** Vote kind enum exposed to the template. */
  readonly VoteKind = VoteKind;

  /** Username of the currently authenticated user. */
  userName = this.authService.getUserName();

  /** Indicates whether the current user has administrator privileges. */
  isAdmin = this.authService.isAdmin();

  /** Controller used to manage the cluster preview popup state. */
  readonly popupController = new PopupController('cluster-preview');

  /** Pin data displayed in the detail panel. */
  pinData = input<PinDto | null>(null);

  /** Pin kind enum exposed to the template. */
  public pinKind = PinKind;

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Event emitted when the panel is closed. */
  @Output() cancel = new EventEmitter<void>();

  /** Event emitted when coordinates are selected for preview. */
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  /** Current vote of the logged-in user for this pin. */
  currentVote = signal<number | null>(null);

  /** Current score shown for the pin. */
  score = signal<number | null>(null);

  /** Prevents multiple vote requests from being sent simultaneously. */
  isVoting = signal<boolean>(false);

  /**
   * Initializes local vote-related state from the provided pin data.
   */
  ngOnInit() {
    const post = this.pinData()?.stats;
    if (!post) return;

    this.score.set(post.score ?? 1000);
    this.currentVote.set(post.currentUserVote ?? null);
  }

  /**
   * Submits or removes a vote for the current pin.
   *
   * Behavior:
   * - If the selected vote is already active, the vote is removed
   * - Otherwise, the selected vote is submitted
   *
   * @param value Vote type to apply
   */
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

  /**
   * Closes the panel and notifies the parent component.
   */
  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  /**
   * Navigates to the delete pin flow for the selected pin.
   */
  deletePin(): void {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }

  /**
   * Emits the selected coordinates and closes the preview popup.
   *
   * @param coords Coordinates associated with the selected pin
   */
  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
  }

  /**
   * Opens the pin coordinates in Google Maps in a new browser tab.
   */
  openGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.pinData()?.geolocation?.latitude},${this.pinData()?.geolocation?.longitude}`;
    window.open(url, '_blank');
  }

  /**
   * Navigates to the related forum post page and closes the popup.
   */
  goToPost() {
    this.router.navigate(['/forum/post', this.pinData()?.id]);
    this.popupController.close();
  }

  /**
   * Navigates to the report pin flow for the selected pin.
   */
  report() {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'report-pin', id]);
  }
}
