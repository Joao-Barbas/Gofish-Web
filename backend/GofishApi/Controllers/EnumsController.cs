using GofishApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;

namespace GofishApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnumsController : Controller
    {
        [HttpGet("GetSeaBedTypes")]
        public IActionResult GetSeaBedTypes()
        {
            var seaBedTypes = Enum.GetValues(typeof(SeaBedType))
                .Cast<SeaBedType>()
                .Select(e => new { Id = (int)e, Name = e.ToString() });

            return Ok(seaBedTypes);
        }


        [HttpGet("GetSpeciesTypes")]
        public IActionResult GetSpeciesTypes()
        {
            var speciesTypes = Enum.GetValues(typeof(SpeciesType))
                .Cast<SpeciesType>()
                .Select(e => new { Id = (int)e, Name = e.ToString() });

            return Ok(speciesTypes);
        }

        [HttpGet("GetBaitTypes")]
        public IActionResult GetBaitTypes()
        {
            var baitTypes = Enum.GetValues(typeof(BaitType))
                .Cast<BaitType>()
                .Select(e => new { Id = (int)e, Name = e.ToString() });

            return Ok(baitTypes);
        }

        [HttpGet("GetWarnPinTypes")]
        public IActionResult GetWarnPinTypes()
        {
            var warnTypes = Enum.GetValues(typeof(WarnPinType))
                .Cast<WarnPinType>()
                .Select(e => new { Id = (int)e, Name = e.ToString() });

            return Ok(warnTypes);
        }


    }
}
