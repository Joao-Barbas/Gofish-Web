using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace GofishApi.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Pin> Pins { get; set; }
        public DbSet<Post> Posts { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            #region Friendship

            builder.Entity<Friendship>()
                .HasKey(f => new { f.RequesterUserId, f.ReceiverUserId });

            builder.Entity<Friendship>()
                .HasOne(f => f.Requester)
                .WithMany(u => u.RequestedFriendships)
                .HasForeignKey(f => f.RequesterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Friendship>()
                .HasOne(f => f.Receiver)
                .WithMany(u => u.ReceivedFriendships)
                .HasForeignKey(f => f.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion // Friendship
            #region Pin

            builder.Entity<Pin>()
                .ToTable("Pins")
                .HasDiscriminator<PinKind>("Kind")
                .HasValue<CatchPin>(PinKind.Catch)
                .HasValue<InfoPin>(PinKind.Information)
                .HasValue<WarnPin>(PinKind.Warning);

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
                .HasForeignKey<Post>(p => p.Id)
                .OnDelete(DeleteBehavior.Cascade);

            #endregion // Pin
            #region Post

            builder.Entity<Post>()
                .HasOne(p => p.AppUser)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            #endregion // Post

            // TODO: Database constraints
        }
    }
}
