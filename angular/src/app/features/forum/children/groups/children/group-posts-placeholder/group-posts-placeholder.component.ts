import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";
import { GetGroupPinsReqDto, GetGroupPostsReqDTO, GetGroupPostsResDTO } from '@gofish/shared/dtos/group.dto';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';
import { GroupsService } from '@gofish/shared/services/groups.service';


@Component({
  selector: 'app-group-posts-placeholder',
  imports: [ForumPostComponent],
  templateUrl: './group-posts-placeholder.component.html',
  styleUrl: './group-posts-placeholder.component.css',
})
export class GroupPostsPlaceholderComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  protected postsData = signal<PinDto[]>([]);
  private lastTimestamp: string = new Date().toISOString();

  ngOnInit() {
    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if(!id) return;
    const dto: GetGroupPinsReqDto = {
      groupId:id,
      maxResults: 5,
      lastTimestamp: this.lastTimestamp
    }
    this.groupsService.getGroupPosts(dto).subscribe({
      next: (res) => {
        this.postsData.set(res.pins);
        console.log('aqui',res)
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
}
