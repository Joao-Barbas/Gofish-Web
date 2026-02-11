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
        public DbSet<Post> Posts { get; set; }

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

            builder.Entity<Pin>()
                .HasOne(p => p.AppUser)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Pin>()
                .HasOne(p => p.Post)
                .WithOne(p => p.Pin)
                .HasForeignKey<Post>(p => p.PinId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Post>()
                .HasIndex(f => f.PinId)
                .IsUnique();

            builder.Entity<Post>()
                .HasOne(p => p.AppUser)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // TODO: Database constraints
        }
    }
}
