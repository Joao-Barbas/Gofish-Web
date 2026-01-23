using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models
{
    public class AppUser : IdentityUser
    {
        [PersonalData]
        // [Required]
        [Column(TypeName = "nvarchar(256)")]
        public string? FirstName { get; set; }

        [PersonalData]
        [Column(TypeName = "nvarchar(256)")]
        public string? LastName { get; set; }
    }
}
