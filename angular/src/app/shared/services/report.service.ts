import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { CreatePinReportReqDTO, CreatePinReportResDTO } from '@gofish/shared/dtos/report.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) { }


  createPinReport(dto: CreatePinReportReqDTO): Observable<CreatePinReportResDTO> {
    return this.http.post<CreatePinReportResDTO>(Api.Report.action('CreatePinReport'), dto);
  }


  /* createCommentReport(dto: CreateCommentReportReqDTO): Observable<CreateCommentReportResDTO> {
    return this.http.post<CreateCommentReportResDTO>(Api.Report.action('CreateCommentReport'), dto);
  } */
}
