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
