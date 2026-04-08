import { Observable, shareReplay } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateInfoPinReqDTO, CreateWarnPinReqDTO, ViewportPinsResDTO, CreatePinResDTO, GetPinsReqDTO, PinDataResDTO, GetPinsResDTO, GetPinsReqDto, GetPinsResDto, GetFeedReqDto, GetFeedResDto, VoteReqDto, VoteResDto, CreateCommentReqDto, CreateCommentResDto, GetCommentsReqDto, GetCommentsResDto, GetInViewportResDto, CommentDto } from '@gofish/shared/dtos/pin.dto';

import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { Api } from '@gofish/shared/constants';


@Injectable({
  providedIn: 'root'
})
export class PinService {
  private pinTypes$?: Observable<EnumDTO[]>;
  private baitTypes$?: Observable<EnumDTO[]>;
  private seaBedTypes$?: Observable<EnumDTO[]>;
  private warnTypes$?: Observable<EnumDTO[]>;
  private speciesTypes$?: Observable<EnumDTO[]>;
  private visibilityTypes$?: Observable<EnumDTO[]>;
  private accessDifficultyTypes$?: Observable<EnumDTO[]>;
  constructor(private http: HttpClient) { }

  createCatchPin(formData: FormData): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateCatchPin'), formData);
  }

  createInfoPin(dto: CreateInfoPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateInfoPin'), dto);
  }

  createWarnPin(dto: CreateWarnPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateWarnPin'), dto);
  }

  deletePin(id: number): Observable<void> {
    return this.http.delete<void>(Api.Pin.action(`DeletePin/${id}`));
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number): Observable<GetInViewportResDto> {
    return this.http.get<GetInViewportResDto>(Api.Pin.action('GetInViewport'), {
      params: { minLat, minLng, maxLat, maxLng }
    });
  }

  getPins(dto: GetPinsReqDto): Observable<GetPinsResDto> {
    return this.http.post<GetPinsResDto>(Api.Pin.action('GetPins'), dto);
  }

  getFeed(dto: GetFeedReqDto): Observable<GetFeedResDto> {
    return this.http.post<GetFeedResDto>(Api.Pin.action('GetFeed'), dto);
  }

  putVote(pinId: number, dto: VoteReqDto): Observable<VoteResDto> {
    return this.http.put<VoteResDto>(Api.Pin.action(`PutVote/${pinId}`), dto);
  }

  deleteVote(pinId: number): Observable<VoteResDto> {
    return this.http.delete<VoteResDto>(Api.Pin.action(`DeleteVote/${pinId}`));
  }

  getUserVote(pinId: number): Observable<VoteResDto> {
    return this.http.get<VoteResDto>(Api.Pin.action(`GetUserVote/${pinId}`));
  }

  createComment(dto: CreateCommentReqDto): Observable<CreateCommentResDto> {
    return this.http.post<CreateCommentResDto>(Api.Pin.action("CreateComment"), dto);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(Api.Pin.action(`DeleteComment/${commentId}`));
  }

  getComment(id: number): Observable<CommentDto> {
    return this.http.get<CommentDto>(Api.Pin.action(`GetComment/${id}`));
  }

  getComments(dto: GetCommentsReqDto): Observable<GetCommentsResDto> {
    return this.http.get<GetCommentsResDto>(Api.Pin.action("GetComments"), {
      params: {
        pinId: dto.pinId.toString(),
        maxResults: dto.maxResults!.toString(),
        ...(dto.lastTimestamp ? { lastTimestamp: dto.lastTimestamp } : {})
      }
    });
  }

  enumeratePinType(): Observable<EnumDTO[]> {
    if (!this.pinTypes$) {
      this.pinTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('PinKind'))
        .pipe(shareReplay(1));
    }
    return this.pinTypes$;
  }

  enumerateBaitType(): Observable<EnumDTO[]> {
    if (!this.baitTypes$) {
      this.baitTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('Bait'))
        .pipe(shareReplay(1));
    }
    return this.baitTypes$;
  }

  enumerateSeaBedType(): Observable<EnumDTO[]> {
    if (!this.seaBedTypes$) {
      this.seaBedTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('Seabed'))
        .pipe(shareReplay(1));
    }
    return this.seaBedTypes$;
  }

  enumerateWarnType(): Observable<EnumDTO[]> {
    if (!this.warnTypes$) {
      this.warnTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('WarningKind'))
        .pipe(shareReplay(1));
    }
    return this.warnTypes$;
  }

  enumerateSpeciesType(): Observable<EnumDTO[]> {
    if (!this.speciesTypes$) {
      this.speciesTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('Species'))
        .pipe(shareReplay(1));
    }
    return this.speciesTypes$;
  }

  enumerateVisibilityType(): Observable<EnumDTO[]> {
    if (!this.visibilityTypes$) {
      this.visibilityTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('VisibilityLevel'))
        .pipe(shareReplay(1));
    }
    return this.visibilityTypes$;
  }

  enumerateAccessDifficultyType(): Observable<EnumDTO[]> {
    if (!this.accessDifficultyTypes$) {
      this.accessDifficultyTypes$ = this.http
        .get<EnumDTO[]>(Api.Enums.action('AccessDifficulty'))
        .pipe(shareReplay(1));
    }
    return this.accessDifficultyTypes$;
  }

}
