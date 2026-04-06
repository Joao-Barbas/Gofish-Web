namespace GofishApi.Dtos;

public record GetPinsCreatedTodayResDTO(
    int PinsCreatedToday
);

public record GetAverageVotesPerPinResDTO(
    double AverageVotesPerPin
);

public record GetPinsWith15PositiveVotesResDTO(
    int PinsWith15PositiveVotes
);

public record GetReportsWaitingReviewResDTO(
    int ReportsWaitingReview
);

public record GetAveragePublishedPinsResDTO(
    double AveragePublishedPins
);

public record GetActiveUsersResDTO(
    int ActiveUsers
);

public record GetSuccessRateOfRequestsDTO(
    double SuccessRateOfRequests
);

public record GetDailyUserSatisfactionAverageDTO(
    int UserSatisfactionAverage
);

public record GetNewUsersTodayResDTO(
    int UsersRegisteredToday
);

public record GetTotalPinsCreatedResDTO(
    int Value
);

public record GetTotalCatchPinsCreatedResDTO(
    int Value
);

public record GetTotalWarningPinsCreatedResDTO(
    int Value
);

public record GetRegisteredUsersWeeklyStatsReqDTO(
    int Year
);

public record GetRegisteredUsersWeeklyStatsResDTO(
    string Label,
    int Value
);

public record GetTotalUsersResDTO(
    int UsersRegistered
);