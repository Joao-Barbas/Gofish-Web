namespace GofishApi.Services;

public interface IEmailChangeTokenService
{
    /// <summary>
    /// Encodes userId + newEmail + a generated 6-digit code into a time-limited
    /// protected token. The code is sent to the user; the token is returned to
    /// the frontend to be presented alongside the code on confirmation.
    /// </summary>
    string CreateToken(string userId, string newEmail, out string code);

    /// <summary>
    /// Decodes and validates the token. Returns false if expired, tampered, or
    /// if the submitted code does not match the one baked into the token.
    /// </summary>
    bool VerifyToken(string token, string submittedCode, out string userId, out string newEmail);
}
