import { Component, inject, signal } from '@angular/core';
import { ForumPostComponent } from "../../components/forum-post/forum-post.component";
import { Router } from '@angular/router';
import { GetFeedReqDTO, GetFeedResDTO } from '@gofish/shared/dtos/get-feed.dto';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PinService } from '@gofish/shared/services/pin.service';
import { GetFeedReqDto, GetFeedResDto } from '@gofish/shared/dtos/pin.dto';
import { FeedKind } from '@gofish/shared/enums/feed-kind.enum';

/**
 * Displays the discovery feed and progressively loads posts using
 * infinite scroll pagination.
 *
 * Responsibilities:
 * - Load discovery feed posts from the backend
 * - Maintain pagination state using the last retrieved timestamp
 * - Detect scroll position and load additional results when needed
 * - Expose loading and pagination state to the template
 */
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

  /**
   * Scroll event handler used to trigger lazy loading when the user
   * gets close to the bottom of the page.
   *
   * Side effects:
   * - Calls loadPosts when pagination conditions are met
   */
  onScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (nearBottom && this.hasMoreResults() && !this.isLoading()) {
      this.loadPosts();
    }
  }

  /**
   * Loads the initial discovery feed data and registers the global
   * scroll event listener.
   *
   * Side effects:
   * - Fetches posts from backend
   * - Registers window scroll listener
   */
  ngOnInit() {
    this.loadPosts();
    window.addEventListener('scroll', this.onScroll);
  }

  /**
   * Removes the registered scroll event listener to prevent memory leaks.
   */
  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }


  /**
   * Loads the next batch of discovery feed posts.
   *
   * Behavior:
   * - Sends a paginated request using the current timestamp cursor
   * - Appends new posts to the existing feed state
   * - Updates pagination metadata and loading state
   *
   * Side effects:
   * - Updates allFeedPosts signal
   * - Updates hasMoreResults signal
   * - Updates lastTimestamp cursor
   */
  loadPosts() {
    if (this.isLoading() || !this.hasMoreResults()) return;
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

  /**
   * Loads additional feed posts on explicit user request.
   *
   * Side effects:
   * - Calls loadPosts
   */
  showMore() {
    this.loadPosts();
  }
}
