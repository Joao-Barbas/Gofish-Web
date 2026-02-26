namespace GofishApi.Dtos;

public record SignUpReqDTO(
    string Email,
    string Password,
    string UserName,
    string FirstName,
    string LastName
);

public record SignUpResDTO(
    // Unused
    // TODO: Send token after successful account creation
);
