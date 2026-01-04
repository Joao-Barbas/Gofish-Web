using GofishApi.Models;

namespace GofishApi.Services
{
    public interface IJwtService
    {
        Task<string> CreateTokenAsync(AppUser user);
    }
}
