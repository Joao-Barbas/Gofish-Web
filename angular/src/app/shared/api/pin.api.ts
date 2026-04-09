// pin.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { SignInReqDTO, SignInResDTO, SignUpReqDTO, SignUpResDTO, TwoFactorSignInReqDTO, TwoFactorSignInResDTO } from "@gofish/shared/dtos/auth.dto";
import { GetPinsReqDto, GetPinsReqDTO, GetPinsResDto, GetPinsResDTO } from "@gofish/shared/dtos/pin.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PinApi {
  private readonly http = inject(HttpClient);

  public getPins(dto: GetPinsReqDto): Observable<GetPinsResDto> {
    return this.http.post<GetPinsResDto>(Api.Pin.action('GetPins'), dto);
  }
}
