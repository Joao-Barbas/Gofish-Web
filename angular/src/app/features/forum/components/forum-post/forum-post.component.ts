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

@Component({
  selector: 'app-forum-post',
  imports: [TimeAgoPipe, EnumComponent, RouterLink, SlicePipe],
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

  ngOnInit() {
    const post = this.postData();
    if (!post) return;

    this.score.set(post.stats?.score ?? 1000);
    this.currentVote.set(post.stats?.currentUserVote ?? null);
    console.log(this.postData());
  }

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

  goToPost() {
    this.router.navigate(['/forum/post', this.postData()?.id]);
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  deletePost() {
    const id = this.postData()?.id;
    if (!id) return;

    this.router.navigate(['/forum', 'delete-post', id]);
  }

  report() {
    const id = this.postData()?.id;
    if (!id) return;

    this.router.navigate(['/forum', 'report-pin', id]);
  }
}
