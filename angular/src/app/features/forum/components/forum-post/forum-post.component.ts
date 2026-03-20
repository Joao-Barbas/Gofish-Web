import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO } from '@gofish/shared/dtos/get-post.dto';
import { PostsService } from '@gofish/shared/services/posts.service';
import { TimeAgoPipe } from "../../../../shared/pipes/time-ago.pipe";
import { PinKind } from '@gofish/shared/models/pin.model';
import { EnumComponent } from "@gofish/enum/enum.component";

@Component({
  selector: 'app-forum-post',
  imports: [TimeAgoPipe, EnumComponent],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
})
export class ForumPostComponent {
  private readonly router = inject(Router);
  postData = input<GetPostsPostDTO | null>(null);
  pinKind = PinKind;

  goToPin() {
    // Tem que se ver como e que se obtem as coordendas porque o post dto nao tem coordenadas
    // Podemos colocar la ?
  }
}
