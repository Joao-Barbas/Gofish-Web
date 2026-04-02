// map.component.ts
import { Component } from '@angular/core';
import { UserHelpBoxComponent } from "@gofish/shared/components/user-help-box/user-help-box.component";

@Component({
  selector: 'app-test-delete-after',
  imports: [UserHelpBoxComponent],
  templateUrl: './test-delete-after.component.html',
  styleUrl: './test-delete-after.component.css',
})
export class TestDELETEAFTERComponent {

  header: string = "Review Pin Reports";
  body: string = "To review Pin Reports, make sure to read the individual reports made by other users and see if there's a pattern of report types that you can then use to understand why the Pin is not suitable for the platform when reading its contents.\n\nMake sure to check every part of the Pin post below to see if it falls under any report type and if so, mark any report type that users have identified on the left.\n\nYou don't need to mark the same report type more than once.";

}
