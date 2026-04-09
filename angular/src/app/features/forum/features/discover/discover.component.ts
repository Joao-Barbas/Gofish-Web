import { Component, inject, signal } from '@angular/core';
import { ForumPostComponent } from "../../components/forum-post/forum-post.component";
import { Router } from '@angular/router';
import { GetFeedReqDTO, GetFeedResDTO } from '@gofish/shared/dtos/get-feed.dto';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PinService } from '@gofish/shared/services/pin.service';
import { GetFeedReqDto, GetFeedResDto } from '@gofish/shared/dtos/pin.dto';
import { FeedKind } from '@gofish/shared/enums/feed-kind.enum';

@Component({
  selector: 'app-discover',
  imports: [ForumPostComponent, LoadingSpinnerComponent],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css',
})
export class DiscoverComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);
  allFeedPosts = signal<GetFeedResDto | null>(null);
  hasMoreResults = signal(true);
  private lastTimestamp: string = new Date().toISOString();
  isLoading = signal(false);

  onScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (nearBottom && this.hasMoreResults() && !this.isLoading()) {
      this.loadPosts();
    }
  }

  ngOnInit() {
    this.loadPosts();
    window.addEventListener('scroll', this.onScroll);
  }

   ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }


  loadPosts() {
    this.isLoading.set(true);
    const request: GetFeedReqDto = {
      kind: FeedKind.Discovery,
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
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    });
  }
  showMore() {
    this.loadPosts();
  }
}
