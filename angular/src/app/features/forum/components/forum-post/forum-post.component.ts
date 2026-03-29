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
  postData = input<GetPostsPostDTO | null>(null);
  pinKind = PinKind;
  currentVote = signal<number | null>(null);
  score = signal<number | null>(null);
  isVoting = signal<boolean>(false);
  isExpanded = false;

  ngOnInit() {
    const post = this.postData();
    if(!post) return;

    this.score.set(post.score ?? 1000);
    this.currentVote.set(post?.userVote ?? null);
    console.log(this.postData());
  }

  goToPin() {
    const lat = this.postData()?.coords?.latitude;
    const lng = this.postData()?.coords?.longitude;
    if (!lat || !lng) {
      console.log('coords null');
      return;
    }
    console.log(lat, lng)
    this.router.navigate(['map'], {
      queryParams: { vLat: lat, vLng: lng, z: 12 },
    });
  }

  vote(value: 1 | -1) {
    if (this.isVoting()) return;

    const postId = this.postData()?.id;
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

  goToPost() {
    this.router.navigate(['/forum/post', this.postData()?.id]);
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }
}
