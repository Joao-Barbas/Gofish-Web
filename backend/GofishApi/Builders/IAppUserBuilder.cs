using GofishApi.Dtos;
using GofishApi.Models;

namespace GofishApi.Builders;

public interface IAppUserBuilder
{
    IAppUserBuilder FromDto(SignUpReqDTO dto);
    Task<AppUser> CreateAsync();
}
