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
    const lat = this.postData()?.coords?.latitude;
    const lng = this.postData()?.coords?.longitude;
    if (!lat || !lng) {
      console.log('coords null');
      return;
    }
    console.log(lat,lng)
    this.router.navigate(['map'], {
      queryParams: { vLat: lat, vLng: lng, z: 14, move: true },
    });
  }
}
