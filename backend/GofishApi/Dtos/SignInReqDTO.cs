namespace GofishApi.Dtos
{
    public record SignInReqDTO(
        string Email, // TODO: Email -> EmailOrUserName
        string Password
    );
}
