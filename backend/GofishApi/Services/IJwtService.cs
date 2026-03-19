using GofishApi.Models;

namespace GofishApi.Services
{
    public interface IJwtService
    {
        Task<string> CreateTokenAsync(AppUser user);
        Task<string> CreateTokenAsync(AppUser user, IList<string> roles);
    }
}
