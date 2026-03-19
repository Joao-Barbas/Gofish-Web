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

    private ExternalLoginInfo? _externalLoginInfo;
    private AppUser _appUser = default!;
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
        _appUser = new AppUser
        {
            Email = dto.Email,
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName
        };
        _password = dto.Password;
        return this;
    }

    public IAppUserBuilder FromExternalLogin(AppUser user, ExternalLoginInfo info)
    {
        _appUser = user;
        _externalLoginInfo = info;
        return this;
    }

    public async Task<AppUser> CreateAsync()
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        IdentityResult result;

        if (_externalLoginInfo is not null)
        {
            result = await _userManager.CreateAsync(_appUser); // No password
            if (!result.Succeeded) throw new IdentityException(result);
            result = await _userManager.AddLoginAsync(_appUser, _externalLoginInfo);
            if (!result.Succeeded) throw new IdentityException(result);
        }
        else
        {
            result = await _userManager.CreateAsync(_appUser, _password);
            if (!result.Succeeded) throw new IdentityException(result);
        }

        result = await _userManager.AddToRoleAsync(_appUser, "User");
        if (!result.Succeeded) throw new IdentityException(result);

        AddProfile();

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();
        return _appUser;
    }

    #endregion // Builder steps

    private void AddProfile()
    {
        var now = DateTime.UtcNow;
        _userProfile = new UserProfile
        {
            UserId = _appUser.Id,
            JoinedAt = now,
            LastActiveAt = now,
            LastUpdateAt = now
        };
        _appUser.UserProfile = _userProfile;
        _db.UserProfiles.Add(_userProfile);
    }
}
