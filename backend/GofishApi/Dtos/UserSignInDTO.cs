namespace GofishApi.Dtos
{
    public class UserSignInDTO
    {
        // TODO: Email -> EmailOrUserName
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
