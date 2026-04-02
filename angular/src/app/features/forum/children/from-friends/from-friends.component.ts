import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetFeedResDto, GetFeedReqDto } from '@gofish/shared/dtos/pin.dto';
import { FeedKind } from '@gofish/shared/enums/feed-kind.enum';
import { PinService } from '@gofish/shared/services/pin.service';
import { ForumPostComponent } from "../../components/forum-post/forum-post.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-from-friends',
  imports: [ForumPostComponent, LoadingSpinnerComponent],
  templateUrl: './from-friends.component.html',
  styleUrl: './from-friends.component.css',
})
export class FromFriendsComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  allFeedPosts = signal<GetFeedResDto | null>(null);
  hasMoreResults = signal(true);
  private lastTimestamp: string = new Date().toISOString();

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    const request: GetFeedReqDto = {
      kind: FeedKind.Friends,
      maxResults: 5,
      lastTimestamp: this.lastTimestamp
    }
    this.pinService.getFeed(request).subscribe({
      next: (res) => {
        this.allFeedPosts.update(current => {

          this.hasMoreResults.set(res.hasMoreResults);

          return {
            ...res,
            pins: [...current?.pins ?? [], ...res.pins]
          };
        });

        if (res.pins.length > 0) {
          const lastPin = res.pins[res.pins.length - 1];
          this.lastTimestamp = lastPin.createdAt;
        } else {
          this.hasMoreResults.set(false);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  showMore() {
    this.loadPosts();
  }
}
