using GofishApi.Dtos;

namespace GofishApi.Builders;

public interface IAppUserBuilder
{
    IAppUserBuilder FromDto(SignUpReqDTO dto);
    Task CreateAsync();
}
