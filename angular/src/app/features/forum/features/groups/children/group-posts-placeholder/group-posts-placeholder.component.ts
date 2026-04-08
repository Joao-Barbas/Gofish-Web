import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";
import { GetGroupPinsReqDto, GetGroupPostsReqDTO, GetGroupPostsResDTO } from '@gofish/shared/dtos/group.dto';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";


@Component({
  selector: 'app-group-posts-placeholder',
  imports: [ForumPostComponent, LoadingSpinnerComponent],
  templateUrl: './group-posts-placeholder.component.html',
  styleUrl: './group-posts-placeholder.component.css',
})
export class GroupPostsPlaceholderComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  protected postsData = signal<PinDto[] | null>(null);
  hasMoreResults = signal(true);
  private lastTimestamp: string = new Date().toISOString();
  isLoading = signal(false);

  onScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

    if (nearBottom && this.hasMoreResults() && !this.isLoading()) {
      this.loadPosts();
    }
  };

  ngOnInit() {
    this.loadPosts();
    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  loadPosts() {
    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!id || this.isLoading() || !this.hasMoreResults()) return;
    const dto: GetGroupPinsReqDto = {
      groupId: id,
      maxResults: 5,
      lastTimestamp: this.lastTimestamp
    }
    this.groupsService.getGroupPosts(dto).subscribe({
      next: (res) => {
        this.postsData.update(current => [...(current ?? []), ...res.pins]);

        if (res.pins.length > 0) {
          const lastComment = res.pins[res.pins.length - 1];
          this.lastTimestamp = lastComment.createdAt;
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
