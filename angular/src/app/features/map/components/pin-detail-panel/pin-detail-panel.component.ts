import { AsyncPipe, CommonModule, NgLocaleLocalization, NumberSymbol } from '@angular/common';
import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { TimeAgoPipe } from '@gofish/shared/pipes/time-ago.pipe';
import { PinKind } from '@gofish/shared/models/pin.model';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { GeoLocationDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-pin-detail-panel',
  imports: [CommonModule, TimeAgoPipe, ClickOutsideDirective],
  templateUrl: './pin-detail-panel.component.html',
  styleUrls: ['./pin-detail-panel.component.css']
})
export class PinDetailPanelComponent {
  private readonly pinService = inject(PinService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  readonly popupController = new PopupController('cluster-preview');
  pinData = input<PinDataResDTO | null>(null);
  public pinKind = PinKind;
  @Output() cancel = new EventEmitter<void>();
  @Output() coords = new EventEmitter<GeoLocationDTO>();

  visibilityOptions: EnumDTO[] = [];
  // WARN
  warnTypeOptions: EnumDTO[] = [];
  // INFO
  accessDifficultyOptions: EnumDTO[] = [];
  seaBedOptions: EnumDTO[] = [];
  // CATCH
  speciesOptions: EnumDTO[] = [];
  baitOptions: EnumDTO[] = [];
  // Vote
  currentVote = signal<number | null>(null);
  score = signal<number | null>(null);
  isVoting = signal<boolean>(false);

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

    // Vote
    this.score.set(this.pinData()?.post?.score ?? 1000);
    console.log("valor do score", this.pinData()?.post?.score);
  }

  vote(value: 1 | -1) {
    if (this.isVoting()) return;

    const postId = this.pinData()?.post?.id;
    if (!postId) return;

    this.isVoting.set(true);
    this.pinService.vote(postId, value).subscribe({
      next: (res) => {
        this.score.set(res.score);
        this.currentVote.set(this.currentVote() === value ? null : value);
        this.isVoting.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isVoting.set(false);
      }
    });
  }

  closePanel(): void {
    this.cancel.emit();
    this.popupController.close();
  }

  deletePin(): void {
    const id = this.pinData()?.id;
    if (!id) return;

    this.router.navigate(['/map', 'delete-pin', id]);
  }

  onPreviewClick(coords: GeoLocationDTO): void {
    this.coords.emit(coords);
    this.popupController.close();
  }

  getEnumLabel(options: EnumDTO[], value: number): string {
    if (value === null) return 'error1';

    const option = options.find(opt => opt.value === value);
    return option ? option.label : 'error2';
  }
}



