using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnumsController : ControllerBase
    {
        private static IEnumerable<PinEnumItemResDTO> Map<T>() where T : struct, Enum
            => Enum.GetValues<T>()
                .Select(e => new PinEnumItemResDTO(Convert.ToInt32(e), e.ToString()));

        [HttpGet("GetPinEnums")]
        public IActionResult GetPinEnums()
        {
            var data = new PinEnumsResDTO
            {
                SeaBedTypes = Map<SeaBedType>(),
                SpeciesTypes = Map<SpeciesType>(),
                BaitTypes = Map<BaitType>(),
                WarnPinTypes = Map<WarnPinType>()
            };

            return Ok(new ApiResponse<PinEnumsResDTO>
            {
                Success = true,
                Data = data
            });
        }
    }
}
