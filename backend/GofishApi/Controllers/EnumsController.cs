using GofishApi.Dtos;
using GofishApi.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Controllers;

[AllowAnonymous]
[ApiController]
[Route("Enumerate/[action]")]
public class EnumsController : ControllerBase
{
    [HttpGet] public IActionResult AccessDifficulty() => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<AccessDifficulty>() });
    [HttpGet] public IActionResult Bait()             => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<Bait>() });
    [HttpGet] public IActionResult PinKind()          => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<PinKind>() });
    [HttpGet] public IActionResult Seabed()           => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<Seabed>() });
    [HttpGet] public IActionResult Species()          => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<Species>() });
    [HttpGet] public IActionResult VisibilityLevel()  => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<VisibilityLevel>() });
    [HttpGet] public IActionResult WarningKind()      => Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<WarningKind>() });
}
