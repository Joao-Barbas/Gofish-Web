import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateInfoPinReqDTO, CreateWarnPinReqDTO, ViewportPinsResDTO, CreatePinResDTO, GetPinsReqDTO, PinDataResDTO, GetPinsResDTO, GetPinsReqDto, GetPinsResDto, GetFeedReqDto, GetFeedResDto, VoteReqDto, VoteResDto, CreateCommentReqDto, CreateCommentResDto, GetCommentsReqDto, GetCommentsResDto, GetInViewportResDto } from '@gofish/shared/dtos/pin.dto';

import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { Api } from '@gofish/shared/constants';
import { VotePostDTO, VotePostResDTO } from '@gofish/shared/dtos/vote-post.dto';
import { GetFeedResDTO } from '@gofish/shared/dtos/get-feed.dto';

@Injectable({
  providedIn: 'root'
})
export class PinService {
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

  putVote(postId: number, dto: VoteReqDto): Observable<VoteResDto> {
    return this.http.put<VoteResDto>(Api.Pin.action(`PutVote/${postId}`), dto);
  }

  deleteVote(postId: number): Observable<VoteResDto> {
    return this.http.delete<VoteResDto>(Api.Pin.action(`DeleteVote/${postId}`));
  }

  createComment(dto: CreateCommentReqDto): Observable<CreateCommentResDto> {
    return this.http.post<CreateCommentResDto>(Api.Pin.action("CreateComment"), dto);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(Api.Pin.action(`DeleteComment/${commentId}`));
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

  enumeratePinType = () => this.http.get<EnumDTO[]>(Api.Enums.action('PinKind'));
  enumerateBaitType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Bait'));
  enumerateSeaBedType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Seabed'));
  enumerateWarnType = () => this.http.get<EnumDTO[]>(Api.Enums.action('WarningKind'));
  enumerateSpeciesType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Species'));
  enumerateVisibilityType = () => this.http.get<EnumDTO[]>(Api.Enums.action('VisibilityLevel'));
  enumerateAccessDifficultyType = () => this.http.get<EnumDTO[]>(Api.Enums.action('AccessDifficulty'));

}
