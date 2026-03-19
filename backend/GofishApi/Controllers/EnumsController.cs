using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/Enumerate/[action]")]
public class EnumsController : ControllerBase
{
    [HttpGet] public IActionResult AccessDifficulty()    => Ok(EnumDTO.FromEnum<AccessDifficulty>());
    [HttpGet] public IActionResult Bait()                => Ok(EnumDTO.FromEnum<Bait>());
    [HttpGet] public IActionResult PinKind()             => Ok(EnumDTO.FromEnum<PinKind>());
    [HttpGet] public IActionResult Seabed()              => Ok(EnumDTO.FromEnum<Seabed>());
    [HttpGet] public IActionResult Species()             => Ok(EnumDTO.FromEnum<Species>());
    [HttpGet] public IActionResult VisibilityLevel()     => Ok(EnumDTO.FromEnum<VisibilityLevel>());
    [HttpGet] public IActionResult WarningKind()         => Ok(EnumDTO.FromEnum<WarningKind>());
    [HttpGet] public IActionResult TwoFactorMethod()     => Ok(EnumDTO.FromEnum<TwoFactorMethod>());
    [HttpGet] public IActionResult FriendshipState()     => Ok(EnumDTO.FromEnum<FriendshipState>());
    [HttpGet] public IActionResult PinReportReason()     => Ok(EnumDTO.FromEnum<PinReportReason>());
    [HttpGet] public IActionResult CommentReportReason() => Ok(EnumDTO.FromEnum<CommentReportReason>());
    [HttpGet] public IActionResult VoteKind()            => Ok(EnumDTO.FromEnum<VoteKind>());

}
