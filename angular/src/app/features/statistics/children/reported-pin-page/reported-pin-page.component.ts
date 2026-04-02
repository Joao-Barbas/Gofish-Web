import { Component } from '@angular/core';
import { GetPostsPostDTO } from '@gofish/shared/dtos/get-post.dto';
import { UserHelpBoxComponent } from "@gofish/shared/components/user-help-box/user-help-box.component";

@Component({
  selector: 'gf-reported-pin-page',
  imports: [UserHelpBoxComponent],
  templateUrl: './reported-pin-page.component.html',
  styleUrl: './reported-pin-page.component.css',
})
export class ReportedPinPageComponent {

  header: string = "Review Pin Reports";
  body: string = "To review Pin Reports, make sure to read the individual reports made by other users and see if there's a pattern of report types that you can then use to understand why the Pin is not suitable for the platform when reading its contents.\n\nMake sure to check every part of the Pin post below to see if it falls under any report type and if so, mark any report type that users have identified on the left.\n\nYou don't need to mark the same report type more than once.";

  alertText: string = "You have yet to mark the Pin post with one of the report type on the left";

}
