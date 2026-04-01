import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { GetPostsPostDTO } from '@gofish/shared/dtos/get-post.dto';
import { GetPinsReqDto, GetPinsReqDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { ReportService } from '@gofish/shared/services/report.service';

@Component({
  selector: 'gf-reported-pin-page',
  imports: [ForumPostComponent],
  templateUrl: './reported-pin-page.component.html',
  styleUrl: './reported-pin-page.component.css',
})
export class ReportedPinPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pinService = inject(PinService);
  private readonly reportService = inject(ReportService);
  protected pinData = signal<PinDto[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    const request: GetPinsReqDto = {
      ids: [{ pinId: Number(id) }],
      dataRequest: {
        includeAuthor: true,
        includeDetails: true,
        includeUgc: true,
        includeStats: true
      }
    };

    this.pinService.getPins(request).subscribe({
      next: (res) => {
        this.pinData.set(res.pins);
      },
      error: (err) => {
        console.error(err);
      }
    });

    this.reportService.getPinReportById(Number(id)).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
