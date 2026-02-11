using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        //public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Pin> Pins { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Pin>()
                .ToTable("Pins")
                .HasDiscriminator<PinType>("PinType")
                .HasValue<CatchPin>(PinType.Catch)
                .HasValue<InfoPin>(PinType.Info)
                .HasValue<WarnPin>(PinType.Warning);

            builder.Entity<Pin>()
                .HasIndex(p => new { p.Latitude, p.Longitude }); // TODO: Spacial index?

            builder.Entity<Pin>()
                .HasIndex(p => new { p.ExpiresAt, p.CreatedAt });
        }
    }
}
