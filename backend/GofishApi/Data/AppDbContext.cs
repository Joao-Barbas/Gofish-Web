using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity;
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

            var hasher = new PasswordHasher<AppUser>();
            var users = new List<AppUser>();



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

            for (int i = 1; i <= 5; i++)
            {
                var user = new AppUser
                {
                    Id = $"seed-player-{i}",
                    UserName = $"player{i}",
                    NormalizedUserName = $"PLAYER{i}",
                    Email = $"player{i}@gofish.com",
                    NormalizedEmail = $"PLAYER{i}@GOFISH.COM",
                    EmailConfirmed = true,
                    SecurityStamp = $"seed-stamp-{i}",
                    ConcurrencyStamp = $"seed-cstamp-{i}",
                    LockoutEnabled = false
                };

                user.PasswordHash = hasher.HashPassword(user, "123456@");
                users.Add(user);
            }
            var catchPins = new List<CatchPin>();
            var warnPins = new List<WarnPin>();
            var infoPins = new List<InfoPin>();

            int pinId = 1;

            double baseLat = 38.5130;
            double baseLng = -8.8730;

            var createdAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);
            var expiresAt = new DateTime(2026, 3, 8, 12, 0, 0, DateTimeKind.Utc);

            for (int i = 0; i < 10; i++)
            {
                catchPins.Add(new CatchPin
                {
                    Id = pinId++,
                    Kind = PinKind.Catch,
                    Visibility = VisibilityLevel.Public,
                    UserId = $"seed-player-{(i % 5) + 1}",
                    Latitude = baseLat + (i * 0.001),
                    Longitude = baseLng + (i * 0.001),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                });
            }

            for (int i = 0; i < 10; i++)
            {
                warnPins.Add(new WarnPin
                {
                    Id = pinId++,
                    Kind = PinKind.Warning,
                    Visibility = VisibilityLevel.Public,
                    WarningKind = WarningKind.AlgaePresence,
                    UserId = $"seed-player-{(i % 5) + 1}",
                    Latitude = baseLat - (i * 0.001),
                    Longitude = baseLng + (i * 0.001),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                });
            }

            for (int i = 0; i < 10; i++)
            {
                infoPins.Add(new InfoPin
                {
                    Id = pinId++,
                    Kind = PinKind.Information,
                    Visibility = VisibilityLevel.Public,
                    AccessDifficulty = 0,
                    Seabed = Seabed.Sand,
                    UserId = $"seed-player-{(i % 5) + 1}",
                    Latitude = baseLat + (i * 0.001),
                    Longitude = baseLng - (i * 0.001),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                });
            }

            builder.Entity<CatchPin>().HasData(catchPins);
            builder.Entity<WarnPin>().HasData(warnPins);
            builder.Entity<InfoPin>().HasData(infoPins);

            builder.Entity<AppUser>().HasData(users);
        }
    }
}
