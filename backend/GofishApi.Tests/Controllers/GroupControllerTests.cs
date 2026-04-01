using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Tests.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using GofishApi.Tests.Fixtutes;

namespace GofishApi.Tests.Controllers;

public class GroupControllerTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;


    public GroupControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    #region GetGroup

    [Fact]
    public async Task GetGroup_WhenGroupExists_ReturnsOk()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Test Group",
                NormalizedName = "TEST GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var body = new GetGroupReqDTO(
            GroupId: groupId,
            DataRequest: new GroupDataRequestDTO(
                IncludePosts: false,
                IncludeMembers: false
            )
        );

        var res = await _client.PostAsJsonAsync("/api/Group/GetGroup", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetGroup_WhenGroupDoesNotExist_ReturnsNotFound()
    {
        var body = new GetGroupReqDTO(
            GroupId: 999999,
            DataRequest: new GroupDataRequestDTO(
                IncludePosts: false,
                IncludeMembers: false
            )
        );

        var res = await _client.PostAsJsonAsync("/api/Group/GetGroup", body);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }


    #endregion

    #region CreateGroup



    #endregion

    #region DeleteGroup

    [Fact]
    public async Task DeleteGroup_AsOwner_ReturnsNoContent()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Delete Me",
                NormalizedName = "DELETE ME",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.DeleteAsync($"/api/Group/DeleteGroup/{groupId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);

        using var scope2 = _factory.Services.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<AppDbContext>();

        var deleted = await db2.Groups.FindAsync(groupId);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteGroup_WhenNotOwner_ReturnsForbid()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Protected Group",
                NormalizedName = "PROTECTED GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "owner-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.DeleteAsync($"/api/Group/DeleteGroup/{groupId}");

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeleteGroup_WhenGroupDoesNotExist_ReturnsNotFound()
    {
        var res = await _client.DeleteAsync("/api/Group/DeleteGroup/999999");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region GetUserGroups

    [Fact]
    public async Task GetUserGroups_ReturnsOnlyUserGroups()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var myGroup = new Group
            {
                Name = "My Group",
                NormalizedName = "MY GROUP",
                Description = "mine",
                AvatarUrl = "https://example.com/my.png",
                CreatedAt = DateTime.UtcNow
            };

            var otherGroup = new Group
            {
                Name = "Other Group",
                NormalizedName = "OTHER GROUP",
                Description = "other",
                AvatarUrl = "https://example.com/other.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.AddRange(myGroup, otherGroup);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = myGroup.Id,
                UserId = "test-user-id",
                Role = GroupRole.Member
            });

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = otherGroup.Id,
                UserId = "someone-else",
                Role = GroupRole.Member
            });

            await db.SaveChangesAsync();
        }

        var res = await _client.GetAsync("/api/Group/GetUserGroups");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<GetUserGroupsResDTO>();
        dto.Should().NotBeNull();
        dto!.Groups.Should().NotBeNull();
        dto.Groups.Should().Contain(g => g.Name == "My Group");
        dto.Groups.Should().NotContain(g => g.Name == "Other Group");
    }

    #endregion

    #region SearchGroups

    [Fact]
    public async Task SearchGroups_WithValidQuery_ReturnsMatchingGroups()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Groups.AddRange(
                new Group
                {
                    Name = "Fishing Legends",
                    NormalizedName = "FISHING LEGENDS",
                    Description = "desc",
                    AvatarUrl = "https://example.com/1.png",
                    CreatedAt = DateTime.UtcNow
                },
                new Group
                {
                    Name = "Hunters Club",
                    NormalizedName = "HUNTERS CLUB",
                    Description = "desc",
                    AvatarUrl = "https://example.com/2.png",
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();
        }

        var res = await _client.GetAsync("/api/Group/SearchGroups?Query=Fish&MaxResults=10");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<SearchGroupsResDto>();
        dto.Should().NotBeNull();
        dto!.Groups.Should().Contain(g => g.Name == "Fishing Legends");
        dto.Groups.Should().NotContain(g => g.Name == "Hunters Club");
    }

    [Fact]
    public async Task SearchGroups_WithShortQuery_ReturnsEmptyList()
    {
        var res = await _client.GetAsync("/api/Group/SearchGroups?Query=A&MaxResults=10");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<SearchGroupsResDto>();
        dto.Should().NotBeNull();
        dto!.Groups.Should().BeEmpty();
    }

    #endregion

    #region SendInvite

    [Fact]
    public async Task SendInvite_AsOwner_ReturnsOk()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Users.Add(new AppUser
            {
                Id = "receiver-user-id",
                UserName = "receiver@test.com",
                NormalizedUserName = "RECEIVER@TEST.COM",
                Email = "receiver@test.com",
                NormalizedEmail = "RECEIVER@TEST.COM",
                EmailConfirmed = true
            });

            var group = new Group
            {
                Name = "Invite Group",
                NormalizedName = "INVITE GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var body = new SendGroupInviteReqDTO("receiver-user-id");

        var res = await _client.PostAsJsonAsync($"/api/Group/SendInvite/{groupId}", body);

        var content = await res.Content.ReadAsStringAsync();

        res.StatusCode.Should().Be(HttpStatusCode.OK, content);

        var dto = await res.Content.ReadFromJsonAsync<SendGroupInviteResDTO>();
        dto.Should().NotBeNull();
        dto!.InviteId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task SendInvite_ToSelf_ReturnsBadRequest()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Invite Self Group",
                NormalizedName = "INVITE SELF GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var body = new SendGroupInviteReqDTO("test-user-id");

        var res = await _client.PostAsJsonAsync($"/api/Group/SendInvite/{groupId}", body);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SendInvite_WhenUserIsNotOwnerOrModerator_ReturnsForbid()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Restricted Group",
                NormalizedName = "RESTRICTED GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Member
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var body = new SendGroupInviteReqDTO("receiver-user-id");

        var res = await _client.PostAsJsonAsync($"/api/Group/SendInvite/{groupId}", body);

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region AcceptInvite

    [Fact]
    public async Task AcceptInvite_WhenInviteDoesNotExist_ReturnsNotFound()
    {
        var res = await _client.PostAsync("/api/Group/AcceptInvite/999999", null);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AcceptInvite_WhenInviteReceiverIsDifferent_ReturnsForbid()
    {
        int inviteId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Forbidden Accept",
                NormalizedName = "FORBIDDEN ACCEPT",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            var invite = new GroupInvite
            {
                GroupId = group.Id,
                RequesterUserId = "owner-id",
                ReceiverUserId = "another-user-id",
                CreatedAt = DateTime.UtcNow,
                State = FriendshipState.Pending
            };

            db.GroupInvites.Add(invite);
            await db.SaveChangesAsync();

            inviteId = invite.Id;
        }

        var res = await _client.PostAsync($"/api/Group/AcceptInvite/{inviteId}", null);

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region RemoveMember

    [Fact]
    public async Task RemoveMember_AsOwner_ReturnsNoContent()
    {
        int groupId;
        const string targetUserId = "member-to-remove";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Remove Member Group",
                NormalizedName = "REMOVE MEMBER GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.AddRange(
                new GroupUser
                {
                    GroupId = group.Id,
                    UserId = "test-user-id",
                    Role = GroupRole.Owner
                },
                new GroupUser
                {
                    GroupId = group.Id,
                    UserId = targetUserId,
                    Role = GroupRole.Member
                }
            );

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.DeleteAsync($"/api/Group/RemoveMember/{groupId}/{targetUserId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);

        using var scope2 = _factory.Services.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<AppDbContext>();

        var membership = await db2.GroupUsers.FirstOrDefaultAsync(gu =>
            gu.GroupId == groupId && gu.UserId == targetUserId);

        membership.Should().BeNull();
    }

    [Fact]
    public async Task RemoveMember_WhenRequesterIsOnlyMember_ReturnsForbid()
    {
        int groupId;
        const string targetUserId = "member-to-remove";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Forbidden Remove",
                NormalizedName = "FORBIDDEN REMOVE",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.AddRange(
                new GroupUser
                {
                    GroupId = group.Id,
                    UserId = "test-user-id",
                    Role = GroupRole.Member
                },
                new GroupUser
                {
                    GroupId = group.Id,
                    UserId = targetUserId,
                    Role = GroupRole.Member
                }
            );

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.DeleteAsync($"/api/Group/RemoveMember/{groupId}/{targetUserId}");

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task RemoveMember_WhenRemovingSelf_ReturnsBadRequest()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Self Remove Group",
                NormalizedName = "SELF REMOVE GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.DeleteAsync($"/api/Group/RemoveMember/{groupId}/test-user-id");

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }


    #endregion

    #region GetGroupMembers

    [Fact]
    public async Task GetGroupMembers_WhenGroupExists_ReturnsOk()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Members Group",
                NormalizedName = "MEMBERS GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Owner
            });

            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var url = $"/api/Group/GetGroupMembers?GroupId={groupId}&MaxResults=10";
        var res = await _client.GetAsync(url);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetGroupMembers_WhenGroupDoesNotExist_ReturnsNotFound()
    {
        var res = await _client.GetAsync("/api/Group/GetGroupMembers?GroupId=999999&MaxResults=10");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region GetGroupPins

    [Fact]
    public async Task GetGroupPins_WhenUserIsMember_ReturnsOk()
    {
        int groupId;
        int pinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Pins Group",
                NormalizedName = "PINS GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();

            db.GroupUsers.Add(new GroupUser
            {
                GroupId = group.Id,
                UserId = "test-user-id",
                Role = GroupRole.Member
            });

            var pin = await PinSeedFixture.CreateInfoPinAsync(db, userId: "test-user-id");

            db.GroupPins.Add(new GroupPin
            {
                GroupId = group.Id,
                PinId = pin.Id
            });

            await db.SaveChangesAsync();

            groupId = group.Id;
            pinId = pin.Id;
        }

        var res = await _client.GetAsync($"/api/Group/GetGroupPins?GroupId={groupId}&MaxResults=10");

        var content = await res.Content.ReadAsStringAsync();

        res.StatusCode.Should().Be(HttpStatusCode.OK, content);

        var dto = await res.Content.ReadFromJsonAsync<GetGroupPinsResDto>();
        dto.Should().NotBeNull();
        dto!.Pins.Should().Contain(p => p.Id == pinId);
    }

    [Fact]
    public async Task GetGroupPins_WhenUserIsNotMember_ReturnsNotFound()
    {
        int groupId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var group = new Group
            {
                Name = "Hidden Group",
                NormalizedName = "HIDDEN GROUP",
                Description = "desc",
                AvatarUrl = "https://example.com/group.png",
                CreatedAt = DateTime.UtcNow
            };

            db.Groups.Add(group);
            await db.SaveChangesAsync();
            groupId = group.Id;
        }

        var res = await _client.GetAsync($"/api/Group/GetGroupPins?GroupId={groupId}&MaxResults=10");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion
}
