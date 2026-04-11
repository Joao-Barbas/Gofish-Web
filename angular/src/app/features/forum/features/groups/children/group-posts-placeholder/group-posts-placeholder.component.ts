import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";
import { GetGroupPinsReqDto, GetGroupPostsReqDTO, GetGroupPostsResDTO } from '@gofish/shared/dtos/group.dto';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";

/**
 * Displays paginated posts belonging to a specific group.
 *
 * Responsibilities:
 * - Load group posts from the backend
 * - Maintain pagination state using a timestamp cursor
 * - Load additional posts when the user scrolls near the bottom
 * - Expose loading and result state to the template
 */
@Component({
  selector: 'app-group-posts-placeholder',
  imports: [ForumPostComponent, LoadingSpinnerComponent],
  templateUrl: './group-posts-placeholder.component.html',
  styleUrl: './group-posts-placeholder.component.css',
})
export class GroupPostsPlaceholderComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);

  /** Stores the currently loaded group posts. */
  protected postsData = signal<PinDto[] | null>(null);

  /** Indicates whether more posts are available to load. */
  hasMoreResults = signal(true);

  /**
   * Timestamp cursor used for incremental pagination.
   * Each new request uses the timestamp of the last loaded post.
   */
  private lastTimestamp: string = new Date().toISOString();

  /** Indicates whether a request is currently in progress. */
  isLoading = signal(false);

  /**
   * Handles page scroll events and triggers loading when the user
   * gets close to the bottom of the page.
   */
  onScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

    if (nearBottom && this.hasMoreResults() && !this.isLoading()) {
      this.loadPosts();
    }
  };

  /**
   * Loads the initial batch of posts and registers the scroll listener.
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
   * Loads the next batch of posts for the current group.
   *
   * Behavior:
   * - Reads the group identifier from the parent route
   * - Sends a paginated request using the current timestamp cursor
   * - Appends new posts to the existing list
   * - Updates pagination and loading state
   */
  loadPosts() {
    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!id || this.isLoading() || !this.hasMoreResults()) return;

    this.isLoading.set(true);

    const dto: GetGroupPinsReqDto = {
      groupId: id,
      maxResults: 5,
      lastTimestamp: this.lastTimestamp
    };

    this.groupsService.getGroupPosts(dto).subscribe({
      next: (res) => {
        this.postsData.update(current => [...(current ?? []), ...res.pins]);

        if (res.pins.length > 0) {
          const lastPin = res.pins[res.pins.length - 1];
          this.lastTimestamp = lastPin.createdAt;
        }

        this.hasMoreResults.set(res.hasMoreResults);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Loads additional group posts on explicit user request.
   */
  showMore() {
    this.loadPosts();
  }

}
