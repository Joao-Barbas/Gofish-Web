using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Builders;

public interface IAppUserBuilder
{
    IAppUserBuilder FromDto(SignUpReqDTO dto);
    IAppUserBuilder FromExternalLogin(AppUser user, ExternalLoginInfo info);
    Task<AppUser> CreateAsync();
}
