import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { CreateCommentReportReqDTO, CreateCommentReportResDTO, CreatePinReportReqDTO, CreatePinReportResDTO, GetReportReqDTO, GetReportResDTO, GetReportsResDTO } from '@gofish/shared/dtos/report.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) { }


  createPinReport(dto: CreatePinReportReqDTO): Observable<CreatePinReportResDTO> {
    return this.http.post<CreatePinReportResDTO>(Api.Report.action('CreatePinReport'), dto);
  }


  createCommentReport(dto: CreateCommentReportReqDTO): Observable<CreateCommentReportResDTO> {
    return this.http.post<CreateCommentReportResDTO>(Api.Report.action('CreateCommentReport'), dto);
  }

  getPinReports(dto: GetReportReqDTO): Observable<GetReportsResDTO> {
    let params = new HttpParams().set('maxResults', dto.maxResults.toString());
    if (dto.lastCreatedAt) {
      params = params.set('lastCreatedAt', dto.lastCreatedAt);
    }
    return this.http.get<GetReportsResDTO>(Api.Report.action('GetPinReports'), { params });
  }

  getPinReportById(id: number): Observable<GetReportResDTO> {
    return this.http.get<GetReportResDTO>(Api.Report.action(`GetPinReport/${id}`));
  }

  getCommentReports(dto: GetReportReqDTO): Observable<GetReportsResDTO> {
    let params = new HttpParams().set('maxResults', dto.maxResults.toString());
    if (dto.lastCreatedAt) {
      params = params.set('lastCreatedAt', dto.lastCreatedAt);
    }
    return this.http.get<GetReportsResDTO>(Api.Report.action('GetCommentReports'), { params });
  }

  getCommentReportById(id: number): Observable<GetReportResDTO> {
    return this.http.get<GetReportResDTO>(Api.Report.action(`GetCommentReport/${id}`));
  }


  deletePinReport(id: number): Observable<void> {
    return this.http.delete<void>(Api.Report.action(`DeletePinReport/${id}`));
  }

  deleteCommentReport(id: number): Observable<void> {
    return this.http.delete<void>(Api.Report.action(`DeleteCommentReport/${id}`));
  }
}
