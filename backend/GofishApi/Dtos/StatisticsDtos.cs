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