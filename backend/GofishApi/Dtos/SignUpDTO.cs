namespace GofishApi.Dtos;

public record SignUpReqDTO(
    string Email,
    string Password,
    string UserName,
    string FirstName,
    string LastName
);

public record SignUpResDTO(
    string Token
);
