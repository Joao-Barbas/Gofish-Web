import { Component } from '@angular/core';
import { ForumPostComponent } from "@gofish/features/forum/components/forum-post/forum-post.component";

@Component({
  selector: 'app-group-posts-placeholder',
  imports: [ForumPostComponent],
  templateUrl: './group-posts-placeholder.component.html',
  styleUrl: './group-posts-placeholder.component.css',
})
export class GroupPostsPlaceholderComponent {

}
