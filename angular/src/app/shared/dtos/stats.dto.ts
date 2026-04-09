export interface GetPinsCreatedTodayResDTO {
  pinsCreatedToday: number;
}

export interface GetAverageVotesPerPinResDTO {
  averageVotesPerPin: number;
}

export interface GetPinsWith15PositiveVotesResDTO {
  pinsWith15PositiveVotes: number;
}

export interface GetReportsWaitingReviewResDTO {
  reportsWaitingReview: number;
}

export interface GetAveragePublishedPinsResDTO {
  averagePublishedPins: number;
}

export interface GetActiveUsersResDTO {
  activeUsers: number;
}

export interface GetSuccessRateOfRequestsDTO {
  successRateOfRequests: number;
}

export interface GetDailyUserSatisfactionAverageDTO {
  userSatisfactionAverage: number;
}

export interface GetNewUsersTodayResDTO {
  usersRegisteredToday: number;
}

export interface GetRegisteredUsersWeeklyStatsReqDTO {
  year: number;
}

export interface GetRegisteredUsersWeeklyStatsResDTO {
  label: string;
  value: number;
}

export interface GetPinsWeeklyStatsReqDTO {
  year: number;
  month: number;
}

export interface GetPinsWeeklyStatsResDTO {
  year: number;
  weekLabel: string;
  catchCount: number;
  infoCount: number;
  warningCount: number;
}
// Home page
export interface GetTotalPinsCreatedResDTO {
  value: number;
}

export interface GetTotalCatchPinsCreatedResDTO {
  value: number;
}

export interface GetTotalWarningPinsCreatedResDTO {
  value: number;
}

export interface GetTotalUsersResDTO {
  usersRegistered: number;
}
