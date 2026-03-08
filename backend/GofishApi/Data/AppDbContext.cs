using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using static System.Net.WebRequestMethods;

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
            var posts = new List<Post>();

            int pinId = 1;

            double baseLat = 38.5130;
            double baseLng = -8.8730;

            var createdAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);
            var expiresAt = new DateTime(2026, 3, 11, 12, 0, 0, DateTimeKind.Utc);

            var random = new Random();

            for (int i = 0; i < 10; i++)
            {
                var id = pinId++;
                var userId = $"seed-player-{(i % 5) + 1}";

                catchPins.Add(new CatchPin
                {
                    Id = id,
                    Kind = PinKind.Catch,
                    Visibility = VisibilityLevel.Public,
                    UserId = userId,
                    Latitude = baseLat + (i * (random.Next(1, 6) / 1000.0)),
                    Longitude = baseLng + (i * (random.Next(1, 6) / 1000.0)),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt,
                    Species = Species.Achiga,
                    Bait = Bait.Worm
                });

                posts.Add(new Post
                {
                    Id = id,
                    Body = "body",
                    ImageUrl = "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png",
                    CreatedAt = createdAt,
                    UserId = userId
                });
            }

            for (int i = 0; i < 10; i++)
            {
                var id = pinId++;
                var userId = $"seed-player-{(i % 5) + 1}";

                warnPins.Add(new WarnPin
                {
                    Id = id,
                    Kind = PinKind.Warning,
                    Visibility = VisibilityLevel.Public,
                    WarningKind = WarningKind.AlgaePresence,
                    UserId = userId,
                    Latitude = baseLat - (i * (random.Next(1, 6) / 1000.0)),
                    Longitude = baseLng + (i * (random.Next(1, 6) / 1000.0)),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                });

                posts.Add(new Post
                {
                    Id = id,
                    Body = "Body",
                    ImageUrl = null,
                    CreatedAt = createdAt,
                    UserId = userId
                });
            }

            for (int i = 0; i < 10; i++)
            {
                var id = pinId++;
                var userId = $"seed-player-{(i % 5) + 1}";

                infoPins.Add(new InfoPin
                {
                    Id = id,
                    Kind = PinKind.Information,
                    Visibility = VisibilityLevel.Public,
                    AccessDifficulty = 0,
                    Seabed = Seabed.Sand,
                    UserId = userId,
                    Latitude = baseLat + (i * (random.Next(1, 6) / 1000.0)),
                    Longitude = baseLng - (i * (random.Next(1, 6) / 1000.0)),
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                });

                posts.Add(new Post
                {
                    Id = id,
                    Body = "body",
                    ImageUrl = null,
                    CreatedAt = createdAt,
                    UserId = userId
                });
            }

            builder.Entity<CatchPin>().HasData(catchPins);
            builder.Entity<WarnPin>().HasData(warnPins);
            builder.Entity<InfoPin>().HasData(infoPins);
            builder.Entity<Post>().HasData(posts);
            builder.Entity<AppUser>().HasData(users);
        }
    }
}
