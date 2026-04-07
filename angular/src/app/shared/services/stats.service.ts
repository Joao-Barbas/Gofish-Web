import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { GetPinsCreatedTodayResDTO, GetReportsWaitingReviewResDTO, GetAverageVotesPerPinResDTO, GetAveragePublishedPinsResDTO, GetActiveUsersResDTO, GetPinsWith15PositiveVotesResDTO, GetSuccessRateOfRequestsDTO, GetNewUsersTodayResDTO, GetRegisteredUsersWeeklyStatsResDTO, GetPinsWeeklyStatsResDTO } from '@gofish/shared/dtos/stats.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly http = inject(HttpClient);

  getPinsCreatedToday(): Observable<GetPinsCreatedTodayResDTO> {
    return this.http.get<GetPinsCreatedTodayResDTO>(Api.Stats.action('GetPinsCreatedToday'));
  }

  getReportsWaitingReview(): Observable<GetReportsWaitingReviewResDTO> {
    return this.http.get<GetReportsWaitingReviewResDTO>(Api.Stats.action('GetReportsWaitingReview'));
  }

  getAverageVotesPerPin(month: number, year: number): Observable<GetAverageVotesPerPinResDTO> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<GetAverageVotesPerPinResDTO>(Api.Stats.action('GetAverageVotesPerPin'), { params });
  }

  getAveragePublishedPins(month: number, year: number): Observable<GetAveragePublishedPinsResDTO> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<GetAveragePublishedPinsResDTO>(Api.Stats.action('GetAveragePublishedPins'), { params });
  }

  getActiveUsers(): Observable<GetActiveUsersResDTO> {
    return this.http.get<GetActiveUsersResDTO>(Api.Stats.action('GetActiveUsers'));
  }

  getPinsWith15PositiveVotes(): Observable<GetPinsWith15PositiveVotesResDTO> {
    return this.http.get<GetPinsWith15PositiveVotesResDTO>(Api.Stats.action('GetPinsWith15PositiveVotes'));
  }

  getWeeklyApiSuccessRate(): Observable<GetSuccessRateOfRequestsDTO> {
    return this.http.get<GetSuccessRateOfRequestsDTO>(Api.Stats.action('GetWeeklyApiSuccessRate'));
  }

  getNewUsersToday(): Observable<GetNewUsersTodayResDTO> {
    return this.http.get<GetNewUsersTodayResDTO>(Api.Stats.action('GetNewUsersToday'));
  }

  getRegisteredUsersWeeklyStats(year: number): Observable<GetRegisteredUsersWeeklyStatsResDTO[]> {
    const params = new HttpParams().set('year', year);
    return this.http.get<GetRegisteredUsersWeeklyStatsResDTO[]>(Api.Stats.action('GetRegisteredUsersWeeklyStats'), { params });
  }

  getPinsWeeklyStats(month: number, year: number): Observable<GetPinsWeeklyStatsResDTO[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<GetPinsWeeklyStatsResDTO[]>(Api.Stats.action('GetPinsWeeklyStats'),{ params });
  }
}
