using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using static System.Net.WebRequestMethods;

namespace GofishApi.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<GroupInvite> GroupInvites { get; set; }
        public DbSet<Pin> Pins { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostVote> PostVote { get; set; }
        public DbSet<PostComment> PostComments { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupPost> GroupPosts { get; set; }
        public DbSet<GroupRole> GroupRoles { get; set; }
        public DbSet<GroupUser> GroupUsers { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<PinReport> PinReports { get; set; }
        public DbSet<CommentReport> CommentReports { get; set; }


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
            #region GroupInvite

            builder.Entity<GroupInvite>()
                .HasOne(gi => gi.Requester)
                .WithMany()
                .HasForeignKey(gi => gi.RequesterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<GroupInvite>()
                .HasOne(gi => gi.Receiver)
                .WithMany()
                .HasForeignKey(gi => gi.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<GroupInvite>()
                .HasOne(gi => gi.Group)
                .WithMany()
                .HasForeignKey(gi => gi.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<GroupInvite>()
                .HasIndex(gi => new { gi.GroupId, gi.ReceiverUserId, gi.State });

            #endregion // GroupInvites
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
            #region PostComment 

            builder.Entity<PostComment>()
                .HasOne(p => p.AppUser)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PostComment>()
               .HasOne(p => p.Post)
               .WithMany()
               .HasForeignKey(p => p.PostId)
               .OnDelete(DeleteBehavior.NoAction);

            #endregion // PostComment
            #region UserProfile 

            builder.Entity<UserProfile>()
                .HasKey(f => f.UserId);

            builder.Entity<UserProfile>()
                .HasOne(p => p.AppUser)
                .WithOne(u => u.UserProfile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            #endregion // UserProfile
            #region GroupPost

            builder.Entity<GroupPost>()
                .HasKey(f => new { f.PostId, f.GroupId });

            builder.Entity<Group>()
                .HasMany(e => e.Posts)
                .WithMany(e => e.Groups)
                .UsingEntity<GroupPost>(
                    r => r.HasOne(e => e.Post).WithMany(e => e.GroupPosts),
                    l => l.HasOne(e => e.Group).WithMany(e => e.GroupPosts)
                );

            #endregion // GroupPost
            #region GroupUser

            builder.Entity<GroupUser>()
                .HasKey(f => new { f.UserId, f.GroupId });

            builder.Entity<Group>()
                .HasMany(e => e.AppUsers)
                .WithMany(e => e.Groups)
                .UsingEntity<GroupUser>(
                    r => r.HasOne(e => e.AppUser).WithMany(e => e.GroupUsers),
                    l => l.HasOne(e => e.Group).WithMany(e => e.GroupUsers)
                );

            #endregion // GroupPost
            #region PostVotes

            builder.Entity<PostVote>()
                .HasKey(pv => new { pv.PostId, pv.UserId });

            builder.Entity<PostVote>()
                .HasOne(pv => pv.Post)
                .WithMany(p => p.PostVotes)
                .HasForeignKey(pv => pv.PostId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PostVote>()
                .HasOne(pv => pv.AppUser)
                .WithMany(u => u.PostVotes)
                .HasForeignKey(pv => pv.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            #endregion
            #region PinReport

            builder.Entity<PinReport>()
                .HasOne(f => f.AppUser)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PinReport>()
                .HasOne(f => f.Pin)
                .WithMany()
                .HasForeignKey(f => f.PinId)
                .OnDelete(DeleteBehavior.Cascade);

            #endregion // PinReport
            #region CommentReport

            builder.Entity<CommentReport>()
                .HasOne(f => f.AppUser)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.NoAction);


            builder.Entity<CommentReport>()
                .HasOne(f => f.Comment)
                .WithMany()
                .HasForeignKey(f => f.CommentId)
                .OnDelete(DeleteBehavior.Cascade);


            #endregion // PinReport

            SeedUsers(builder);
            SeedCatchPin(builder);
            SeedInfoPin(builder);
            SeedWarnPin(builder);
            SeedGroupRoles(builder);
        }

        private static void SeedUsers(ModelBuilder builder)
        {
            var hasher = new PasswordHasher<AppUser>();
            var users = new List<AppUser>();
            var profiles = new List<UserProfile>();
            var now = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

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
                    LockoutEnabled = false,
                };
                user.PasswordHash = hasher.HashPassword(user, "123456@");
                users.Add(user);
                profiles.Add(new UserProfile
                {
                    UserId = $"seed-player-{i}",
                    JoinedAt = now,
                    LastActiveAt = now,
                    LastUpdateAt = now
                });
            }

            builder.Entity<AppUser>().HasData(users);
            builder.Entity<UserProfile>().HasData(profiles);
        }
        private static void SeedCatchPin(ModelBuilder builder) 
        {
            int pinId = 1;

            double baseLat = 38.5130;
            double baseLng = -8.8730;
            var createdAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);
            var expiresAt = new DateTime(2026, 3, 11, 12, 0, 0, DateTimeKind.Utc);
            var random = new Random();

            var catchPins = new List<CatchPin>();
            var posts = new List<Post>();

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

            builder.Entity<CatchPin>().HasData(catchPins);
            builder.Entity<Post>().HasData(posts);
        }
        private static void SeedInfoPin(ModelBuilder builder) 
        {
            int pinId = 101;

            double baseLat = 38.5130;
            double baseLng = -8.8730;
            var createdAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);
            var expiresAt = new DateTime(2026, 3, 11, 12, 0, 0, DateTimeKind.Utc);
            var random = new Random();

            var infoPins = new List<InfoPin>();
            var posts = new List<Post>();


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

            builder.Entity<InfoPin>().HasData(infoPins);
            builder.Entity<Post>().HasData(posts);
        }
        private static void SeedWarnPin(ModelBuilder builder)
        {
            int pinId = 201;

            double baseLat = 38.5130;
            double baseLng = -8.8730;
            var createdAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);
            var expiresAt = new DateTime(2026, 3, 11, 12, 0, 0, DateTimeKind.Utc);
            var random = new Random();

            var warnPins = new List<WarnPin>();
            var posts = new List<Post>();


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

            builder.Entity<WarnPin>().HasData(warnPins);
            builder.Entity<Post>().HasData(posts);
        }
        private static void SeedGroupRoles(ModelBuilder builder)
        {
            var roles = new List<GroupRole>
    {
        new GroupRole
        {
            Id = "1",
            Name = "Owner",
            NormalizedName = "OWNER"
        },
        new GroupRole
        {
            Id = "2",
            Name = "Admin",
            NormalizedName = "ADMIN"
        },
        new GroupRole
        {
            Id = "3",
            Name = "Member",
            NormalizedName = "MEMBER"
        }
    };

            builder.Entity<GroupRole>().HasData(roles);
        }
    }
}
