import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO } from '@gofish/shared/dtos/get-post.dto';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { PinKind } from '@gofish/shared/models/pin.model';
import { EnumComponent } from "@gofish/shared/components/enum/enum.component";
import { AuthService } from '@gofish/shared/services/auth.service';
import { PinService } from '@gofish/shared/services/pin.service';
import { Path } from '@gofish/shared/constants';
import { SlicePipe } from '@angular/common';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { VoteKind } from '@gofish/shared/enums/vote-kind.enum';
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { toast } from 'ngx-sonner';

/**
 * Displays a forum post preview with voting, navigation, reporting,
 * and utility actions such as copying the post link or opening its
 * location in Google Maps.
 *
 * Responsibilities:
 * - Render post metadata and content
 * - Track local vote and score state
 * - Navigate to related views
 * - Handle post actions such as delete, report, and share
 */

@Component({
  selector: 'app-forum-post',
  imports: [TimeAgoPipe, EnumComponent, RouterLink, SlicePipe, UserTitleComponent, CdkCopyToClipboard],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
})

export class ForumPostComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly pinService = inject(PinService);
  readonly avatarService = inject(AvatarService);
  readonly Path = Path;
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  postData = input<PinDto | null>(null);
  pinKind = PinKind;
  currentVote = signal<number | null>(null);
  score = signal<number | null>(null);
  isVoting = signal<boolean>(false);
  isExpanded = false;

  /**
   * Initializes local component state from the provided post input.
   *
   * Side effects:
   * - Sets score signal
   * - Sets current vote signal
   */
  ngOnInit() {
    const post = this.postData();
    if (!post) return;

    this.score.set(post.stats?.score ?? 1000);
    this.currentVote.set(post.stats?.currentUserVote ?? null);
    console.log(this.postData());
  }

  /**
   * Navigates to the map view centered on the post coordinates.
   *
   * Side effects:
   * - Triggers route navigation to the map page
   */
  goToPin() {
    const lat = this.postData()?.geolocation?.latitude;
    const lng = this.postData()?.geolocation?.longitude;
    if (!lat || !lng) {
      console.log('coords null');
      return;
    }
    console.log(lat, lng)
    this.router.navigate(['map'], {
      queryParams: { vLat: lat, vLng: lng, z: 12 },
    });
  }

  /**
   * Submits or removes a vote for the current post.
   *
   * Behavior:
   * - If the selected vote is already active, the vote is removed
   * - Otherwise, the selected vote is submitted
   *
   * @param value Vote type to apply (upvote or downvote)
   *
   * Side effects:
   * - Sends vote request to backend
   * - Updates score and current vote signals
   * - Locks voting while request is in progress
   */
  vote(value: VoteKind.Upvote | VoteKind.Downvote) {
    if (this.isVoting()) return;

    const postId = this.postData()?.id;
    if (!postId) return;

    const current = this.currentVote();
    this.isVoting.set(true);

    if (current === value) {
      this.pinService.deleteVote(postId).subscribe({
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

    this.pinService.putVote(postId, { value }).subscribe({
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
   * Navigates to the full post details page.
   *
   * Side effects:
   * - Triggers route navigation to forum post details
   */
  goToPost() {
    this.router.navigate(['/forum/post', this.postData()?.id]);
  }

  /**
   * Toggles the expanded/collapsed state of the post content.
   */
  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  /**
  * Navigates to the delete post workflow for the current post.
  *
  * Side effects:
  * - Triggers route navigation to delete confirmation page
  */
  deletePost() {
    const id = this.postData()?.id;
    if (!id) return;

    this.router.navigate(['/forum', 'delete-post', id]);
  }

  /**
   * Navigates to the report workflow for the current post.
   *
   * Side effects:
   * - Triggers route navigation to report form/page
   */
  report() {
    const id = this.postData()?.id;
    if (!id) return;

    this.router.navigate(['/forum', 'report-pin', id]);
  }

  /**
   * Copies a direct link to the specified post to the clipboard.
   *
   * @param postId Identifier of the post
   *
   * Side effects:
   * - Writes to clipboard
   * - Displays success toast notification
   */
  copyLink(postId: number | string) {
    const link = `${window.location.origin}/forum/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast.success('Post link copied to clipboard!');
  }

  /**
   * Opens the post coordinates in Google Maps in a new browser tab.
   *
   * Side effects:
   * - Opens external Google Maps URL
   */
  openGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.postData()?.geolocation?.latitude},${this.postData()?.geolocation?.longitude}`;
    window.open(url, '_blank');
  }
}
