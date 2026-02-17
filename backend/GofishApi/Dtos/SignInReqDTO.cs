namespace GofishApi.Dtos
{
    public record SignInReqDTO(
        string EmailOrUserName,
        string Password
    );
}
