using GofishApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        // public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<CatchPin> CatchPins { get; set; }
        public DbSet<InfoPin> InfoPins { get; set; }
        public DbSet<WarnPin> WarnPins { get; set; }
    }
}
