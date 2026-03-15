using Microsoft.AspNetCore.Identity;
using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Exceptions;
using GofishApi.Models;

namespace GofishApi.Builders;

public class AppUserBuilder : IAppUserBuilder
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;

    private AppUser _user = default!;
    private UserProfile _userProfile = default!;
    private string _password = default!;

    public AppUserBuilder(
        UserManager<AppUser> userManager,
        AppDbContext db
    )
    {
        _userManager = userManager;
        _db = db;
    }

    #region Builder steps

    public IAppUserBuilder FromDto(SignUpReqDTO dto)
    {
        _user = new AppUser
        {
            Email = dto.Email,
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName
        };
        _password = dto.Password;
        return this;
    }

    public async Task CreateAsync()
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        var result = await _userManager.CreateAsync(_user, _password);
        if (!result.Succeeded) throw new IdentityException(result);

        result = await _userManager.AddToRoleAsync(_user, "User");
        if (!result.Succeeded) throw new IdentityException(result);

        AddProfile();

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    #endregion // Builder steps

    private void AddProfile()
    {
        var now = DateTime.UtcNow;
        _userProfile = new UserProfile
        {
            UserId = _user.Id,
            JoinedAt = now,
            LastActiveAt = now,
            LastUpdateAt = now
        };
        _db.UserProfiles.Add(_userProfile);
    }
}
