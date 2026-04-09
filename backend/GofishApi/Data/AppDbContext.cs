using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using System.Numerics;
using System.Reflection.Emit;

namespace GofishApi.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<GroupInvite> GroupInvites { get; set; }
    public DbSet<Pin> Pins { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupPin> GroupPins { get; set; }
    public DbSet<GroupUser> GroupUsers { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<PinReport> PinReports { get; set; }
    public DbSet<CommentReport> CommentReports { get; set; }
    public DbSet<RequestLogs> RequestLogs { get; set; }
    public DbSet<Rating> Ratings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {

        base.OnModelCreating(builder);

        #region Friendship

        builder.Entity<Friendship>()
            .HasIndex(f => new { f.RequesterUserId, f.ReceiverUserId })
            .IsUnique();

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

        builder.Entity<Friendship>()
            .HasIndex(f => new { f.RequesterUserId, f.State, f.CreatedAt });

        builder.Entity<Friendship>()
            .HasIndex(f => new { f.ReceiverUserId, f.State, f.CreatedAt });

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
            .HasIndex(p => new { p.Latitude, p.Longitude }); // TODO: Create spacial index ???

        builder.Entity<Pin>()
            .HasIndex(p => new { p.ExpiresAt, p.CreatedAt });

        builder.Entity<Pin>()
            .HasOne(p => p.AppUser)
            .WithMany(u => u.Pins)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion // Pin
        #region Comment 

        builder.Entity<Comment>()
            .HasOne(p => p.AppUser)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Comment>()
            .HasOne(p => p.Pin)
            .WithMany(p => p.Comments)
            .HasForeignKey(p => p.PinId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion // Comment
        #region UserProfile 

        builder.Entity<UserProfile>()
            .HasKey(f => f.UserId);

        builder.Entity<UserProfile>()
            .HasOne(p => p.AppUser)
            .WithOne(u => u.UserProfile)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion // UserProfile
        #region GroupPin

        builder.Entity<GroupPin>()
            .HasKey(f => new { f.PinId, f.GroupId });

        builder.Entity<Group>()
            .HasMany(e => e.Pins)
            .WithMany(e => e.Groups)
            .UsingEntity<GroupPin>(
                r => r.HasOne(e => e.Pin).WithMany(e => e.GroupPins),
                l => l.HasOne(e => e.Group).WithMany(e => e.GroupPins));

        #endregion // GroupPin
        #region GroupUser

        builder.Entity<GroupUser>()
            .HasKey(f => new { f.UserId, f.GroupId });

        builder.Entity<Group>()
            .HasMany(e => e.AppUsers)
            .WithMany(e => e.Groups)
            .UsingEntity<GroupUser>(
                r => r.HasOne(e => e.AppUser).WithMany(e => e.GroupUsers),
                l => l.HasOne(e => e.Group).WithMany(e => e.GroupUsers));

        #endregion // GroupUser
        #region Votes

        builder.Entity<Vote>()
            .HasIndex(f => new { f.UserId, f.PinId })
            .IsUnique();

        builder.Entity<Vote>()
            .HasOne(pv => pv.Pin)
            .WithMany(p => p.Votes)
            .HasForeignKey(pv => pv.PinId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Vote>()
            .HasOne(pv => pv.AppUser)
            .WithMany(u => u.Votes)
            .HasForeignKey(pv => pv.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion // Votes
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

        #endregion // CommentReport
        #region Ratings

        builder.Entity<Rating>()
            .HasKey(r => r.UserId);

        builder.Entity<Rating>()
            .HasOne(r => r.AppUser)
            .WithOne(u => u.Rating)
            .HasForeignKey<Rating>(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion

        SeedUsers(builder);
        SeedRoles(builder);
        SeedCatchPin(builder);
        SeedInfoPin(builder);
        SeedWarnPin(builder);
        SeedGroups(builder);
        SeedPinReports(builder);
        SeedVotes(builder);
        SeedFriendships(builder);
        SeedUserRoles(builder);
        SeedComments(builder);
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
                FirstName = $"player-{i}",
                LastName = $"player-last-name-{i}",
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
                UserId = user.Id,
                JoinedAt = now,
                LastActiveAt = now,
                LastUpdateAt = now
            });
        }

        var admin = new AppUser
        {
            Id = "seed-admin-1",
            UserName = "admin1",
            NormalizedUserName = "ADMIN1",
            Email = "admin@gofish.com",
            NormalizedEmail = "ADMIN@GOFISH.COM",
            EmailConfirmed = true,
            SecurityStamp = "seed-admin-stamp",
            ConcurrencyStamp = "seed-admin-cstamp",
            LockoutEnabled = false,
        };

        admin.PasswordHash = hasher.HashPassword(admin, "123456@");
        users.Add(admin);

        profiles.Add(new UserProfile
        {
            UserId = admin.Id,
            JoinedAt = now,
            LastActiveAt = now,
            LastUpdateAt = now
        });

        builder.Entity<AppUser>().HasData(users);
        builder.Entity<UserProfile>().HasData(profiles);
    }

    private static void SeedRoles(ModelBuilder builder)
    {
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole
            {
                Id = "role-admin",
                Name = "Admin",
                NormalizedName = "ADMIN"
            },
            new IdentityRole
            {
                Id = "role-user",
                Name = "User",
                NormalizedName = "USER"
            }
        );
    }

    private static void SeedCatchPin(ModelBuilder builder)
    {
        int pinId = 1;

        double baseLat = 38.5130;
        double baseLng = -8.8730;
        var random = new Random(1);
        var createdAt = DateTime.UtcNow.AddDays(-random.Next(0, 30));
        var expiresAt = createdAt.AddDays(CatchPin.ExpiresInDays);
        var catchPins = new List<CatchPin>();

        for (int i = 0; i < 10; i++)
        {
            var userId = $"seed-player-{(i % 5) + 1}";

            catchPins.Add(new CatchPin
            {
                Id = pinId++,
                Kind = PinKind.Catch,
                Visibility = VisibilityLevel.Public,
                UserId = userId,
                Latitude = baseLat + (i * (random.Next(1, 6) / 1000.0)),
                Longitude = baseLng + (i * (random.Next(1, 6) / 1000.0)),
                CreatedAt = createdAt,
                ExpiresAt = expiresAt,
                Body = "body",
                ImageUrl = "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png",
                Species = Species.Achiga,
                Bait = Bait.Worm
            });
        }

        builder.Entity<CatchPin>().HasData(catchPins);
    }

    private static void SeedInfoPin(ModelBuilder builder)
    {
        int pinId = 101;

        double baseLat = 38.5130;
        double baseLng = -8.8730;
        var random = new Random(2);
        var createdAt = DateTime.UtcNow.AddDays(-random.Next(0, 7));
        var expiresAt = createdAt.AddDays(InfoPin.ExpiresInDays);

        var infoPins = new List<InfoPin>();

        for (int i = 0; i < 10; i++)
        {
            var userId = $"seed-player-{(i % 5) + 1}";

            infoPins.Add(new InfoPin
            {
                Id = pinId++,
                Kind = PinKind.Information,
                Visibility = VisibilityLevel.Public,
                UserId = userId,
                Latitude = baseLat + (i * (random.Next(1, 6) / 1000.0)),
                Longitude = baseLng - (i * (random.Next(1, 6) / 1000.0)),
                CreatedAt = createdAt,
                ExpiresAt = expiresAt,
                Body = "body",
                ImageUrl = null,
                AccessDifficulty = 0,
                Seabed = Seabed.Sand
            });
        }

        builder.Entity<InfoPin>().HasData(infoPins);
    }

    private static void SeedWarnPin(ModelBuilder builder)
    {
        int pinId = 201;

        double baseLat = 38.5130;
        double baseLng = -8.8730;
        var random = new Random(3);
        var createdAt = DateTime.UtcNow.AddDays(-random.Next(0, 7));
        var expiresAt = createdAt.AddDays(WarnPin.ExpiresInDays);

        var warnPins = new List<WarnPin>();

        for (int i = 0; i < 10; i++)
        {
            var userId = $"seed-player-{(i % 5) + 1}";

            warnPins.Add(new WarnPin
            {
                Id = pinId++,
                Kind = PinKind.Warning,
                Visibility = VisibilityLevel.Public,
                UserId = userId,
                Latitude = baseLat - (i * (random.Next(1, 6) / 1000.0)),
                Longitude = baseLng + (i * (random.Next(1, 6) / 1000.0)),
                CreatedAt = createdAt,
                ExpiresAt = expiresAt,
                Body = "Body",
                ImageUrl = null,
                WarningKind = WarningKind.AlgaePresence
            });
        }

        builder.Entity<WarnPin>().HasData(warnPins);
    }

    private static void SeedComments(ModelBuilder builder)
    {
        var now = new DateTime(2026, 3, 8, 12, 0, 0, DateTimeKind.Utc);

        var comments = new List<Comment>();
        int id = 1;

        var pinIds = new List<int>
    {
        1, 2, 3,        // Catch
        101, 102, 103,  // Info
        201, 202, 203   // Warn
    };

        foreach (var pinId in pinIds)
        {
            for (int u = 1; u <= 3; u++) 
            {
                comments.Add(new Comment
                {
                    Id = id++,
                    PinId = pinId,
                    UserId = $"seed-player-{u}",
                    Body = $"Comment {id} on pin {pinId}",
                    CreatedAt = now.AddMinutes(-id)
                });
            }
        }

        builder.Entity<Comment>().HasData(comments);
    }

    private static void SeedGroups(ModelBuilder builder)
    {
        var groups = new List<Group>();
        var groupUsers = new List<GroupUser>();
        var now = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);

        for (int i = 1; i <= 10; i++)
        {
            var name = $"Group {i}";
            var ownerId = $"seed-player-{((i - 1) % 5) + 1}";

            groups.Add(new Group
            {
                Id = i,
                Name = name,
                NormalizedName = name.ToUpper(),
                Description = $"This is group {i} for fishing enthusiasts.",
                AvatarUrl = $"https://picsum.photos/seed/group{i}/200/200",
                CreatedAt = now
            });

            groupUsers.Add(new GroupUser
            {
                GroupId = i,
                UserId = ownerId,
                Role = GroupRole.Owner
            });
        }

        builder.Entity<Group>().HasData(groups);
        builder.Entity<GroupUser>().HasData(groupUsers);
    }

    private static void SeedPinReports(ModelBuilder builder)
    {
        var now = new DateTime(2026, 3, 5, 12, 0, 0, DateTimeKind.Utc);

        var reports = new List<PinReport>
    {
        new PinReport
        {
            Id = 1,
            UserId = "seed-player-1",
            PinId = 1,
            Reason = PinReportReason.Spam,
            CreatedAt = now,
            Description = "This pin looks like spam."
        },
        new PinReport
        {
            Id = 2,
            UserId = "seed-player-2",
            PinId = 101,
            Reason = PinReportReason.Spam,
            CreatedAt = now,
            Description = "The information in this pin seems incorrect."
        },
        new PinReport
        {
            Id = 3,
            UserId = "seed-player-3",
            PinId = 201,
            Reason = PinReportReason.DuplicatePin,
            CreatedAt = now,
            Description = "This pin contains inappropriate content."
        }
    };

        builder.Entity<PinReport>().HasData(reports);
    }

    private static void SeedVotes(ModelBuilder builder)
    {
        var votes = new List<Vote>();
        var now = new DateTime(2026, 3, 6, 12, 0, 0, DateTimeKind.Utc);

        int id = 1;

        // Vamos votar em alguns pins de cada tipo
        var pinIds = new List<int>
    {
        1, 2, 3,       // CatchPins
        101, 102, 103, // InfoPins
        201, 202, 203  // WarnPins
    };

        var random = new Random(10);

        foreach (var pinId in pinIds)
        {
            for (int u = 1; u <= 5; u++)
            {
                // opcional: nem todos os users votam em todos os pins
                if (random.Next(0, 2) == 0) continue;

                votes.Add(new Vote
                {
                    Id = id++,
                    PinId = pinId,
                    UserId = $"seed-player-{u}",
                    Value = random.Next(0, 2) == 0 ? VoteKind.Upvote : VoteKind.Downvote,
                    CreatedAt = now
                });
            }
        }

        builder.Entity<Vote>().HasData(votes);
    }

    private static void SeedFriendships(ModelBuilder builder)
    {
        var now = new DateTime(2026, 3, 7, 12, 0, 0, DateTimeKind.Utc);

        var friendships = new List<Friendship>
    {
        new Friendship
        {
            Id = 1,
            RequesterUserId = "seed-player-1",
            ReceiverUserId = "seed-player-2",
            State = FriendshipState.Accepted,
            CreatedAt = now,
            RepliedAt = now.AddHours(1)
        },
        new Friendship
        {
            Id = 2,
            RequesterUserId = "seed-player-1",
            ReceiverUserId = "seed-player-3",
            State = FriendshipState.Accepted,
            CreatedAt = now,
            RepliedAt = now.AddHours(2)
        },

        new Friendship
        {
            Id = 3,
            RequesterUserId = "seed-player-2",
            ReceiverUserId = "seed-player-4",
            State = FriendshipState.Pending,
            CreatedAt = now,
            RepliedAt = null
        },
        new Friendship
        {
            Id = 4,
            RequesterUserId = "seed-player-5",
            ReceiverUserId = "seed-player-1",
            State = FriendshipState.Pending,
            CreatedAt = now,
            RepliedAt = null
        },

        new Friendship
        {
            Id = 5,
            RequesterUserId = "seed-player-3",
            ReceiverUserId = "seed-player-5",
            State = FriendshipState.Refused,
            CreatedAt = now,
            RepliedAt = now.AddHours(3)
        }
    };

        builder.Entity<Friendship>().HasData(friendships);
    }

    private static void SeedUserRoles(ModelBuilder builder)
    {
        builder.Entity<IdentityUserRole<string>>().HasData(
            new IdentityUserRole<string>
            {
                UserId = "seed-admin-1",
                RoleId = "role-admin"
            }
        );
    }
}
