import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { PinService } from '@gofish/shared/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { GetPostsPostDTO } from '@gofish/shared/dtos/get-post.dto';
import { PinDataResDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';

@Component({
  selector: 'app-enum',
  imports: [],
  templateUrl: './enum.component.html',
  styleUrl: './enum.component.css',
})
export class EnumComponent {
  private readonly pinService = inject(PinService);
  pinData = input<PinDto | null>(null);
  postData = input<PinDto | null>(null);
  public pinKind = PinKind;

  visibilityOptions: EnumDTO[] = [];
  // WARN
  warnTypeOptions: EnumDTO[] = [];
  // INFO
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];
  // CATCH
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];
  ngOnInit() {
    // Visibility
    this.pinService.enumerateVisibilityType().subscribe({
      next: (res: EnumDTO[]) => {
        this.visibilityOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    // Warn
    this.pinService.enumerateWarnType().subscribe({
      next: (res: EnumDTO[]) => {
        this.warnTypeOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });

    // INFO
    this.pinService.enumerateSeaBedType().subscribe({
      next: (res: EnumDTO[]) => {
        this.seaBedOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    this.pinService.enumerateAccessDifficultyType().subscribe({
      next: (res: EnumDTO[]) => {
        this.accessDifficultyOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    // CATCH
    this.pinService.enumerateSpeciesType().subscribe({
      next: (res: EnumDTO[]) => this.speciesOptions = res
    });

    this.pinService.enumerateBaitType().subscribe({
      next: (res) => this.baitOptions = res
    });
  }

    getEnumDisplayName(options: EnumDTO[], value: number): string {
    if (value === null) return 'error1';

    const option = options.find(opt => opt.value === value);
    return option ? option.display : 'error2';
  }
}
