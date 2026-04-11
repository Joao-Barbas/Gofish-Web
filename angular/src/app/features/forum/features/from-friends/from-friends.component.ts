import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetFeedResDto, GetFeedReqDto } from '@gofish/shared/dtos/pin.dto';
import { FeedKind } from '@gofish/shared/enums/feed-kind.enum';
import { PinService } from '@gofish/shared/services/pin.service';
import { ForumPostComponent } from "../../components/forum-post/forum-post.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";

/**
 * Displays the feed composed of posts from the user's friends.
 *
 * Responsibilities:
 * - Load friend feed posts from the backend
 * - Maintain pagination state using a timestamp cursor
 * - Trigger incremental loading when the user scrolls near the bottom
 * - Expose loading and result state to the template
 */
@Component({
  selector: 'app-from-friends',
  imports: [ForumPostComponent, LoadingSpinnerComponent],
  templateUrl: './from-friends.component.html',
  styleUrl: './from-friends.component.css',
})
export class FromFriendsComponent {
  private readonly router = inject(Router);
  private readonly pinService = inject(PinService);

  /** Stores the currently loaded friend feed data. */
  allFeedPosts = signal<GetFeedResDto | null>(null);

  /** Indicates whether more feed results are available. */
  hasMoreResults = signal(true);

  /**
   * Timestamp cursor used for feed pagination.
   * Each request uses the timestamp of the last loaded post.
   */
  private lastTimestamp: string = new Date().toISOString();

  /** Indicates whether a feed request is currently in progress. */
  isLoading = signal(false);

  /**
   * Handles page scroll events and loads more posts when the user
   * gets close to the bottom of the page.
   */
  onScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (nearBottom && this.hasMoreResults() && !this.isLoading()) {
      this.loadPosts();
    }
  }

  /**
   * Loads the initial friend feed data and registers the scroll listener.
   */
  ngOnInit() {
    this.loadPosts();
    window.addEventListener('scroll', this.onScroll);
  }

  /**
   * Removes the scroll listener when the component is destroyed.
   */
  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  /**
   * Loads the next batch of friend feed posts.
   *
   * Behavior:
   * - Sends a paginated request using the current timestamp cursor
   * - Appends new posts to the existing list
   * - Updates loading and pagination state
   */
  loadPosts() {
    if (this.isLoading() || !this.hasMoreResults()) return;
    this.isLoading.set(true);

    const request: GetFeedReqDto = {
      kind: FeedKind.Friends,
      maxResults: 5,
      lastTimestamp: this.lastTimestamp
    };

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

  /**
   * Loads additional posts on explicit user request.
   */
  showMore() {
    this.loadPosts();
  }
}
