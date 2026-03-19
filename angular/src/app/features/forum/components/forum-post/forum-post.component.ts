import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO } from '@gofish/shared/dtos/get-post.dto';
import { PostsService } from '@gofish/shared/services/posts.service';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";

@Component({
  selector: 'app-forum-post',
  imports: [TimeAgoPipe],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
})
export class ForumPostComponent {
  private readonly router = inject(Router);
  postData = input<GetPostsPostDTO | null>(null);

  goToPin() {
    // Tem que se ver como e que se obtem as coordendas porque o post dto nao tem coordenadas
    // Podemos colocar la ?
  }
}
