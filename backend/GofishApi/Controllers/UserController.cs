using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Extensions;
using GofishApi.Models;
using GofishApi.Options;
using GofishApi.Services;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using System.Diagnostics.Metrics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GofishApi.Controllers;

/// <summary>
/// Controlador responsável pela gestão de utilizadores, amizades,
/// leaderboards, grupos associados ao utilizador e convites de grupo.
/// </summary>
[Authorize]
[Route("api/[controller]/[action]")]
[ApiController]
public class UserController : ControllerBase
{
    /// <summary>Logger para registo de eventos e erros.</summary>
    private readonly ILogger<UserController> _logger;

    /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>Contexto de acesso à base de dados da aplicação.</summary>
    private readonly AppDbContext _db;

    /// <summary>Serviço responsável pelas regras de gamificação.</summary>
    private readonly IGamificationService _gamification;

    /// <summary>Serviço responsável pelas regras de visibilidade e relações entre utilizadores.</summary>
    private readonly IVisibilityService _visibility;

    /// <summary>Opções de configuração da gamificação.</summary>
    private readonly IOptions<GamificationOptions> _gamificationOptions;

    /// <summary>
    /// Inicializa uma nova instância do controlador de utilizadores.
    /// </summary>
    /// <param name="logger">Logger da aplicação.</param>
    /// <param name="userManager">Gestor de utilizadores.</param>
    /// <param name="db">Contexto da base de dados.</param>
    /// <param name="gamification">Serviço de gamificação.</param>
    /// <param name="visibility">Serviço de visibilidade.</param>
    /// <param name="gamificationOptions">Opções de gamificação.</param>
    public UserController(
        ILogger<UserController> logger,
        UserManager<AppUser> userManager,
        AppDbContext db,
        IGamificationService gamification,
        IVisibilityService visibility,
        IOptions<GamificationOptions> gamificationOptions
    )
    {
        _logger = logger;
        _userManager = userManager;
        _db = db;
        _gamification = gamification;
        _visibility = visibility;
        _gamificationOptions = gamificationOptions;
    }

    #region User

    /// <summary>
    /// Obtém os dados públicos de um utilizador, incluindo o estado de amizade
    /// entre o utilizador autenticado e o utilizador pedido.
    /// </summary>
    /// <param name="id">Identificador do utilizador.</param>
    /// <returns>Dados do utilizador e eventual estado de amizade.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var thisUser = await _db.Users.FindAsync(id);

        if (thisUser is null)
        {
            return NotFound();
        }

        var friendship = await _db.Friendships.FirstOrDefaultAsync(f =>
            (f.RequesterUserId == authUserId && f.ReceiverUserId == id) ||
            (f.RequesterUserId == id && f.ReceiverUserId == authUserId));

        return Ok(GetUserResDto.FromEntity(thisUser, friendship?.State));
    }

    /// <summary>
    /// Obtém as definições e dados configuráveis do utilizador autenticado.
    /// O email e o número de telefone são devolvidos mascarados.
    /// </summary>
    /// <returns>Definições do utilizador autenticado.</returns>
    [HttpGet]
    public async Task<IActionResult> GetUserSettings()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return NotFound();
        }

        var data = GetUserSettingsResDto.FromEntity(user) with
        {
            Email = MaskEmail(user.Email),
            PhoneNumber = MaskPhone(user.PhoneNumber)
        };

        return Ok(data);
    }

    /// <summary>
    /// Atualiza integralmente os dados editáveis do utilizador autenticado.
    /// Alterações ao username podem implicar custo em pontos de gamificação.
    /// A alteração de email não é permitida por este endpoint.
    /// </summary>
    /// <param name="dto">Novos dados do utilizador.</param>
    /// <returns>Resposta de sucesso.</returns>
    [HttpPut]
    public async Task<IActionResult> PutUser([FromBody] PutUserReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        using var transaction = await _db.Database.BeginTransactionAsync();

        var gamificationResult = await _gamification.TryDecrementPoints(userId, _gamificationOptions.Value.UsernameChangeCost);
        if (!gamificationResult.Succeeded) throw new GamificationException(gamificationResult);

        user.UserName = dto.UserName;
        user.DisplayName = dto.DisplayName;
        user.PhoneNumber = dto.PhoneNumber;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        if (dto.BirthDate is not null) user.BirthDate = dto.BirthDate;
        if (dto.Gender is not null) user.Gender = dto.Gender;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) throw new IdentityException(result);

        if (!string.Equals(dto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException("Bad Request", "Use the dedicated email change flow to change your email.", StatusCodes.Status400BadRequest);
        }

        await transaction.CommitAsync();
        return Ok();
    }

    /// <summary>
    /// Atualiza parcialmente os dados editáveis do utilizador autenticado.
    /// Alterações ao username podem implicar custo em pontos de gamificação.
    /// A alteração de email não é permitida por este endpoint.
    /// </summary>
    /// <param name="dto">Dados parciais do utilizador a atualizar.</param>
    /// <returns>Resposta de sucesso.</returns>
    [HttpPatch]
    public async Task<IActionResult> PatchUser([FromBody] PatchUserReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        using var transaction = await _db.Database.BeginTransactionAsync();

        if (dto.UserName is not null)
        {
            var gamificationResult = await _gamification.TryDecrementPoints(userId, _gamificationOptions.Value.UsernameChangeCost);
            if (!gamificationResult.Succeeded) throw new GamificationException(gamificationResult);
            user.UserName = dto.UserName;
        }

        if (dto.DisplayName is not null) user.DisplayName = dto.DisplayName;
        if (dto.PhoneNumber is not null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.LastName is not null) user.LastName = dto.LastName;
        if (dto.BirthDate is not null) user.BirthDate = dto.BirthDate;
        if (dto.Gender is not null) user.Gender = dto.Gender;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) throw new IdentityException(result);

        if (dto.Email is not null && !string.Equals(dto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException("Bad Request", "Use the dedicated email change flow to change your email.", StatusCodes.Status400BadRequest);
        }

        await transaction.CommitAsync();
        return Ok();
    }

    /// <summary>
    /// Pesquisa utilizadores por username normalizado com suporte a paginação incremental.
    /// Exclui o utilizador autenticado dos resultados.
    /// </summary>
    /// <param name="dto">Critérios de pesquisa e paginação.</param>
    /// <returns>Lista paginada de utilizadores encontrados.</returns>
    [HttpGet]
    public async Task<IActionResult> SearchUsers([FromQuery] SearchUsersReqDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Query) || dto.Query.Length < 2)
        {
            return Ok(new SearchUsersResDto([], false, null));
        }

        var maxResults = Math.Clamp(dto.MaxResults, 1, 50);
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var normalizedQuery = dto.Query.ToUpper();

        var query = _db.Users
            .Where(u => u.Id != userId)
            .Where(u => u.NormalizedUserName!.Contains(normalizedQuery));

        if (dto.LastUsername is not null)
        {
            query = query.Where(u => u.NormalizedUserName!.CompareTo(dto.LastUsername.ToUpper()) > 0);
        }

        var users = await query
            .OrderBy(u => u.NormalizedUserName)
            .Take(maxResults + 1)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.DisplayName,
                u.UserProfile.AvatarUrl,
                u.UserProfile.CatchPoints,
                u.NormalizedUserName
            })
            .ToListAsync();

        var hasMore = users.Count > maxResults;
        var page = users.Take(maxResults).ToList();

        var data = page.Select(u => new SearchUserDto
        {
            Id = u.Id,
            UserName = u.UserName ?? "",
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            CatchPoints = u.CatchPoints,
            Rank = GamificationService.GetRank(u.CatchPoints),
        })
        .ToList();

        var lastUsername = hasMore ? users[^1].NormalizedUserName : null;
        return Ok(new SearchUsersResDto(data, hasMore, lastUsername));
    }

    /// <summary>
    /// Obtém o leaderboard global dos 100 utilizadores com mais catch points,
    /// incluindo a posição do utilizador autenticado mesmo que esteja fora do top 100.
    /// </summary>
    /// <returns>Entradas do leaderboard global e posição do utilizador atual.</returns>
    [HttpGet]
    public async Task<IActionResult> GetGlobalLeaderboard()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var top100 = await _db.UserProfiles
        .OrderByDescending(up => up.CatchPoints)
        .Take(100)
        .Select(up => new {
            up.UserId,
            up.AppUser.UserName,
            up.AppUser.DisplayName,
            up.AvatarUrl,
            up.CatchPoints,
            up.CatchPointsLastMonth,
            up.WeeklyStreak
        })
        .ToListAsync();

        var entries = top100.Select((u, i) => new LeaderboardUserDto
        {
            Position = i + 1,
            UserId = u.UserId,
            UserName = u.UserName ?? "",
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            CatchPoints = u.CatchPoints,
            CatchPointsDelta = u.CatchPoints - u.CatchPointsLastMonth,
            WeeklyStreak = u.WeeklyStreak,
            Rank = GamificationService.GetRank(u.CatchPoints),
        })
        .ToList();

        var currentUser = entries.FirstOrDefault(e => e.UserId == userId);

        if (currentUser is null)
        {
            var userProfile = await _db.UserProfiles
            .Where(up => up.UserId == userId)
            .Select(up => new
            {
                up.AppUser.UserName,
                up.AppUser.DisplayName,
                up.AvatarUrl,
                up.CatchPoints,
                up.CatchPointsLastMonth,
                up.WeeklyStreak
            })
            .FirstOrDefaultAsync();

            if (userProfile is null)
            {
                return BadRequest("Current does not has a profile.");
            }

            var position = await _db.UserProfiles.CountAsync(up => up.CatchPoints > userProfile.CatchPoints) + 1;
            currentUser = new LeaderboardUserDto
            {
                Position = position,
                UserId = userId,
                UserName = userProfile.UserName ?? "",
                DisplayName = userProfile.DisplayName,
                AvatarUrl = userProfile.AvatarUrl,
                CatchPoints = userProfile.CatchPoints,
                CatchPointsDelta = userProfile.CatchPoints - userProfile.CatchPointsLastMonth,
                WeeklyStreak = userProfile.WeeklyStreak,
                Rank = GamificationService.GetRank(userProfile.CatchPoints),
            };
        }

        return Ok(new LeaderboardResDto(entries, currentUser));
    }

    /// <summary>
    /// Obtém o leaderboard entre amigos do utilizador autenticado,
    /// incluindo o próprio utilizador.
    /// </summary>
    /// <returns>Entradas do leaderboard de amigos.</returns>
    [HttpGet]
    public async Task<IActionResult> GetFriendsLeaderboard()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        List<string> friendIds =
        [
            .. await _visibility.GetFriendIds(userId).ToListAsync(),
            userId,
        ];

        var top25 = await _db.UserProfiles
        .Where(up => friendIds.Contains(up.UserId))
        .OrderByDescending(up => up.CatchPoints)
        .Take(25)
        .Select(up => new
        {
            up.UserId,
            up.AppUser.UserName,
            up.AppUser.DisplayName,
            up.AvatarUrl,
            up.CatchPoints,
            up.CatchPointsLastMonth,
            up.WeeklyStreak
        })
        .ToListAsync();

        var entries = top25.Select((u, i) => new LeaderboardUserDto
        {
            Position = i + 1,
            UserId = u.UserId,
            UserName = u.UserName ?? "",
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            CatchPoints = u.CatchPoints,
            CatchPointsDelta = u.CatchPoints - u.CatchPointsLastMonth,
            WeeklyStreak = u.WeeklyStreak,
            Rank = GamificationService.GetRank(u.CatchPoints)
        })
        .ToList();

        var currentUser = entries.FirstOrDefault(e => e.UserId == userId);

        return Ok(new LeaderboardResDto(entries, currentUser));
    }

    /// <summary>
    /// Mascara parcialmente um endereço de email para apresentação segura.
    /// </summary>
    /// <param name="email">Email original.</param>
    /// <returns>Email mascarado.</returns>
    private static string? MaskEmail(string? email)
    {
        if (email is null) return null;
        var parts = email.Split('@');
        if (parts.Length != 2) return email;
        var name = parts[0];
        var masked = name[0] + new string('*', Math.Max(name.Length - 1, 1));
        return $"{masked}@{parts[1]}";
    }

    /// <summary>
    /// Mascara parcialmente um número de telefone para apresentação segura.
    /// </summary>
    /// <param name="phone">Número de telefone original.</param>
    /// <returns>Número de telefone mascarado.</returns>
    private static string? MaskPhone(string? phone)
    {
        if (phone is null) return null;
        if (phone.Length <= 4) return new string('*', phone.Length);
        return phone[..4] + " *** *** " + phone[^3..];
    }

    #endregion // User

    #region Friendship

    /// <summary>
    /// Obtém a lista paginada de amizades de um utilizador.
    /// Se o utilizador alvo não for o autenticado, apenas permite consultar amizades aceites.
    /// </summary>
    /// <param name="dto">Critérios de filtro e paginação.</param>
    /// <returns>Lista paginada de amizades.</returns>
    [HttpGet]
    public async Task<IActionResult> GetFriendships([FromQuery] GetFriendshipsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var targetUserId = dto.UserId ?? authUserId;

        var userExists = await _db.Users.AnyAsync(u => u.Id == targetUserId);
        if (!userExists) return NotFound();

        var isAuthUser = targetUserId == authUserId;
        if (!isAuthUser && dto.State != FriendshipState.Accepted)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "Forbidden", "You cannot view pending requests of other users."));
        }

        var query = _db.Friendships.Where(f => f.RequesterUserId == targetUserId || f.ReceiverUserId == targetUserId);

        if (dto.State is not null)
            query = query.Where(f => f.State == dto.State);
        if (dto.LastTimestamp is not null)
            query = query.Where(f => f.CreatedAt < dto.LastTimestamp.Value);

        var results = await query
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .OrderByDescending(f => f.CreatedAt)
        .ThenByDescending(f => f.Id)
        .Take(maxResults + 1)
        .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var data = page.Select(FriendshipDto.FromEntity);
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetFriendshipsResDto(data, hasMore, lastTime));
    }

    /// <summary>
    /// Obtém uma amizade específica pelo seu identificador.
    /// Utilizadores não participantes só podem vê-la se estiver aceite.
    /// </summary>
    /// <param name="id">Identificador da amizade.</param>
    /// <returns>Dados da amizade.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetFriendship(int id)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .FirstOrDefaultAsync(f => f.Id == id);

        if (friendship is null) return NoContent();
        if (!IsParticipant(authUserId, friendship)) return NotFound();

        return Ok(FriendshipDto.FromEntity(friendship));
    }

    /// <summary>
    /// Obtém a amizade entre dois utilizadores.
    /// Utilizadores não participantes só podem vê-la se estiver aceite.
    /// </summary>
    /// <param name="dto">Identificadores dos dois utilizadores.</param>
    /// <returns>Dados da amizade entre os utilizadores.</returns>
    [HttpGet]
    public async Task<IActionResult> GetFriendshipBetween([FromQuery] GetFriendshipBetweenReqDto dto)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .FirstOrDefaultAsync(f =>
            (f.RequesterUserId == dto.UserId1 && f.ReceiverUserId == dto.UserId2) ||
            (f.RequesterUserId == dto.UserId2 && f.ReceiverUserId == dto.UserId1)
        );

        if (friendship is null) return NoContent();
        if (!IsParticipant(authUserId, friendship)) return NotFound();

        return Ok(FriendshipDto.FromEntity(friendship));
    }

    /// <summary>
    /// Envia um pedido de amizade para outro utilizador.
    /// </summary>
    /// <param name="dto">Dados do pedido de amizade.</param>
    /// <returns>Amizade criada em estado pendente.</returns>
    [HttpPost]
    public async Task<IActionResult> RequestFriendship([FromBody] RequestFriendshipReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId == dto.ReceiverId)
        {
            return BadRequest(ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "InvalidReceiver", "You cannot send a friend request to yourself."));
        }

        var receiverExists = await _db.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        if (!receiverExists) return NotFound();

        var friendshipExists = await _db.Friendships.AnyAsync(f =>
            (f.RequesterUserId == userId && f.ReceiverUserId == dto.ReceiverId) ||
            (f.RequesterUserId == dto.ReceiverId && f.ReceiverUserId == userId));
        if (friendshipExists) return Conflict();

        var friendship = new Friendship
        {
            RequesterUserId = userId,
            ReceiverUserId = dto.ReceiverId,
            State = FriendshipState.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Friendships.Add(friendship);
        await _db.SaveChangesAsync();

        await _db.Entry(friendship).Reference(f => f.Requester).LoadAsync();
        await _db.Entry(friendship.Requester).Reference(u => u.UserProfile).LoadAsync();
        await _db.Entry(friendship).Reference(f => f.Receiver).LoadAsync();
        await _db.Entry(friendship.Receiver).Reference(u => u.UserProfile).LoadAsync();

        var res = FriendshipDto.FromEntity(friendship);
        return CreatedAtAction(nameof(GetFriendship), new { id = friendship.Id }, res);
    }

    /// <summary>
    /// Aceita um pedido de amizade pendente recebido pelo utilizador autenticado.
    /// </summary>
    /// <param name="id">Identificador da amizade.</param>
    /// <returns>Resposta de sucesso.</returns>
    [HttpPatch("{id}")]
    public async Task<IActionResult> AcceptFriendship(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships.FindAsync(id);

        if (friendship is null
            || friendship.State != FriendshipState.Pending
            || friendship.ReceiverUserId != userId
        )
        {
            return NotFound();
        }

        friendship.State = FriendshipState.Accepted;
        friendship.RepliedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }

    /// <summary>
    /// Remove uma amizade ou pedido de amizade.
    /// Apenas os participantes o podem fazer.
    /// </summary>
    /// <param name="id">Identificador da amizade.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFriendship(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships.FindAsync(id);
        if (friendship is null) return NotFound();

        var isParticipant = friendship.RequesterUserId == userId || friendship.ReceiverUserId == userId;
        if (!isParticipant) return NotFound();

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Ignora um pedido de amizade reutilizando a lógica de remoção da amizade.
    /// </summary>
    /// <param name="id">Identificador da amizade.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> IgnoreFriendship(int id)
    {
        return await DeleteFriendship(id);
    }

    /// <summary>
    /// Determina se o utilizador autenticado é participante numa amizade
    /// ou se a amizade é pública por já estar aceite.
    /// </summary>
    /// <param name="authUserId">Identificador do utilizador autenticado.</param>
    /// <param name="friendship">Entidade amizade.</param>
    /// <returns><c>true</c> se a amizade for visível; caso contrário, <c>false</c>.</returns>
    private bool IsParticipant(string authUserId, Friendship friendship)
    {
        var isParticipant = friendship.RequesterUserId == authUserId || friendship.ReceiverUserId == authUserId;
        if (!isParticipant && friendship.State != FriendshipState.Accepted) return false;
        return true;
    }

    #endregion // Friendship

    #region Groups

    /// <summary>
    /// Obtém a lista paginada de grupos de um utilizador.
    /// Se não for indicado utilizador, usa o utilizador autenticado.
    /// </summary>
    /// <param name="dto">Critérios de paginação e utilizador alvo.</param>
    /// <returns>Lista paginada de grupos do utilizador.</returns>
    [HttpGet]
    public async Task<IActionResult> GetUserGroups([FromQuery] GetUserGroupReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var targetUserId = dto.UserId ?? authUserId;

        var userExists = await _db.Users.AnyAsync(u => u.Id == targetUserId);

        if (!userExists)
        {
            return NotFound();
        }

        var query = _db.Groups.Where(g => g.GroupUsers.Any(gu => gu.UserId == targetUserId));

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(g => g.CreatedAt < dto.LastTimestamp.Value);
        }

        var groups = await query
        .OrderByDescending(g => g.CreatedAt)
        .ThenByDescending(g => g.Id)
        .Take(maxResults + 1)
        .Select(g => new UserGroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            AvatarUrl = g.AvatarUrl,
            CreatedAt = g.CreatedAt,
            Role = g.GroupUsers.First(gu => gu.UserId == targetUserId).Role,
            MemberCount = g.GroupUsers.Count,
            PinCount = g.Pins.Count
        })
        .ToListAsync();

        var hasMore = groups.Count > maxResults;
        var page = groups.Take(maxResults).ToList();
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetUserGroupResDto(page, hasMore, lastTime));
    }

    /// <summary>
    /// Obtém a lista de grupos em que o utilizador autenticado pode convidar
    /// o utilizador alvo, considerando permissões, pertença e convites pendentes.
    /// </summary>
    /// <param name="dto">Utilizador alvo e critérios de paginação.</param>
    /// <returns>Lista paginada de grupos convidáveis.</returns>
    [HttpGet]
    public async Task<IActionResult> GetInvitableGroups([FromQuery] GetInvitableGroupsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        if (authUserId == dto.TargetUserId)
        {
            return BadRequest(ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "InvalidTarget", "You cannot invite yourself."));
        }

        var targetExists = await _db.Users.AnyAsync(u => u.Id == dto.TargetUserId);

        if (!targetExists)
        {
            return NotFound();
        }

        var query = _db.Groups
        .Where(g => g.GroupUsers.Any(gu => gu.UserId == authUserId
            && (gu.Role == GroupRole.Owner || gu.Role == GroupRole.Moderator)))
        .Where(g => !g.GroupUsers.Any(gu => gu.UserId == dto.TargetUserId))
        .Where(g => !_db.GroupInvites.Any(gi => gi.GroupId == g.Id
            && gi.ReceiverUserId == dto.TargetUserId
            && gi.State == FriendshipState.Pending));

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(g => g.CreatedAt < dto.LastTimestamp.Value);
        }

        var groups = await query
        .OrderByDescending(g => g.CreatedAt)
        .ThenByDescending(g => g.Id)
        .Take(maxResults + 1)
        .Select(g => new UserGroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            AvatarUrl = g.AvatarUrl,
            CreatedAt = g.CreatedAt,
            Role = g.GroupUsers.First(gu => gu.UserId == authUserId).Role,
            MemberCount = g.GroupUsers.Count,
            PinCount = g.Pins.Count
        })
        .ToListAsync();

        var hasMore = groups.Count > maxResults;
        var page = groups.Take(maxResults).ToList();
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetInvitableGroupsResDto(page, hasMore, lastTime));
    }

    /// <summary>
    /// Obtém a lista paginada de convites de grupo recebidos pelo utilizador autenticado.
    /// </summary>
    /// <param name="dto">Critérios de filtro por estado e paginação.</param>
    /// <returns>Lista paginada de convites de grupo.</returns>
    [HttpGet]
    public async Task<IActionResult> GetGroupInvites([FromQuery] GetGroupInvitesReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var query = _db.GroupInvites.Where(gi => gi.ReceiverUserId == userId);

        if (dto.State is not null)
        {
            query = query.Where(gi => gi.State == dto.State);
        }
        if (dto.LastTimestamp is not null)
        {
            query = query.Where(gi => gi.CreatedAt < dto.LastTimestamp.Value);
        }

        var results = await query
        .OrderByDescending(gi => gi.CreatedAt)
        .ThenByDescending(gi => gi.Id)
        .Take(maxResults + 1)
        .Select(gi => new
        {
            gi.Id,
            gi.State,
            gi.CreatedAt,
            Requester = new
            {
                gi.Requester.Id,
                gi.Requester.UserName,
                gi.Requester.DisplayName,
                gi.Requester.UserProfile.AvatarUrl,
                Membership = gi.Group.GroupUsers
                .Where(gu => gu.UserId == gi.RequesterUserId)
                .Select(gu => new { gu.Role, gu.JoinedAt })
                .FirstOrDefault()
            },
            Group = new
            {
                gi.Group.Id,
                gi.Group.Name,
                gi.Group.Description,
                gi.Group.AvatarUrl,
                gi.Group.CreatedAt,
                MemberCount = gi.Group.GroupUsers.Count,
                PinCount = gi.Group.Pins.Count,
                Owner = gi.Group.GroupUsers
                .Where(gu => gu.Role == GroupRole.Owner)
                .Select(gu => new
                {
                    gu.AppUser.Id,
                    gu.AppUser.UserName,
                    gu.AppUser.DisplayName,
                    gu.AppUser.UserProfile.AvatarUrl,
                    gu.Role,
                    gu.JoinedAt
                })
                .FirstOrDefault()
            }
        })
        .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();

        var data = page.Select(i => new GroupInviteDto
        {
            Id = i.Id,
            InviteState = i.State,
            CreatedAt = i.CreatedAt,
            Requester = new GroupMemberDto(
                i.Requester.Id,
                i.Requester.UserName ?? "",
                i.Requester.DisplayName,
                i.Requester.AvatarUrl,
                i.Requester.Membership?.Role ?? GroupRole.Member,
                i.Requester.Membership?.JoinedAt ?? default
            ),
            Group = new GroupDto
            {
                Id = i.Group.Id,
                Name = i.Group.Name,
                Description = i.Group.Description,
                AvatarUrl = i.Group.AvatarUrl,
                CreatedAt = i.Group.CreatedAt,
                MemberCount = i.Group.MemberCount,
                PinCount = i.Group.PinCount,
                IsCurrentUserMember = false,
                Owner = i.Group.Owner is null ? null! : new GroupMemberDto(
                    i.Group.Owner.Id,
                    i.Group.Owner.UserName ?? "",
                    i.Group.Owner.DisplayName,
                    i.Group.Owner.AvatarUrl,
                    i.Group.Owner.Role,
                    i.Group.Owner.JoinedAt)
            }
        }).ToList();

        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;
        return Ok(new GetGroupInvitesResDto(data, hasMore, lastTime));
    }

    #endregion // Groups
}