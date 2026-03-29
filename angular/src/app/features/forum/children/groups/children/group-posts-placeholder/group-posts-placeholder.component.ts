import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";
import { GetGroupPostsReqDTO, GetGroupPostsResDTO } from '@gofish/shared/dtos/group.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';


@Component({
  selector: 'app-group-posts-placeholder',
  imports: [],
  templateUrl: './group-posts-placeholder.component.html',
  styleUrl: './group-posts-placeholder.component.css',
})
export class GroupPostsPlaceholderComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  protected postsData = signal<GetGroupPostsResDTO | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if(!id) return;
    const dto: GetGroupPostsReqDTO = {
      groupId:id,
      kind: PinKind.CATCH,
      maxResults: 5
    }
    this.groupsService.getGroupPosts(dto).subscribe({
      next: (res) => {
        this.postsData.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
