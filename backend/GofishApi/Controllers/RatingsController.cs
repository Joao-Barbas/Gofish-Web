using GofishApi.Controllers;
using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


/// <summary>
/// Controlador responsável pela gestão de ratings submetidos pelos utilizadores.
/// Permite criar, atualizar, consultar e remover avaliações.
/// </summary>
[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RatingsController : ControllerBase
{
    /// <summary>Logger para registo de eventos e erros.</summary>
    private readonly ILogger<StatsController> _logger;

    /// <summary>Contexto de acesso à base de dados da aplicação.</summary>
    private readonly AppDbContext _db;

    /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>
    /// Inicializa uma nova instância do controlador de ratings.
    /// </summary>
    /// <param name="logger">Logger da aplicação.</param>
    /// <param name="db">Contexto da base de dados.</param>
    /// <param name="userManager">Gestor de utilizadores.</param>
    public RatingsController(
        ILogger<StatsController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    /// <summary>
    /// Cria uma nova avaliação associada ao utilizador autenticado.
    /// </summary>
    /// <param name="dto">Dados da avaliação a criar.</param>
    /// <returns>Identificador do utilizador associado à avaliação criada.</returns>
    [HttpPost]
    public async Task<IActionResult> CreateRating([FromBody] CreateRatingReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var rating = new Rating
        {
            CreatedAt = DateTime.UtcNow,
            Stars = dto.Stars,
            Title = dto.Title,
            Body = dto.Body,
            UserId = user.Id
        };

        _db.Ratings.Add(rating);
        await _db.SaveChangesAsync();
        return Ok(new CreateRatingResDTO(rating.UserId));
    }

    /// <summary>
    /// Atualiza uma avaliação existente.
    /// Apenas o autor da avaliação a pode modificar.
    /// </summary>
    /// <param name="id">Identificador da avaliação.</param>
    /// <param name="dto">Novos dados da avaliação.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRating(int id, [FromBody] UpdateRatingReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var rating = await _db.Ratings.FindAsync(id);
        if (rating is null) return NotFound();

        if (rating.UserId != user.Id)
            return Forbid();

        rating.Stars = dto.Stars;
        rating.Title = dto.Title;
        rating.Body = dto.Body;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    #region GetRatings

    /// <summary>
    /// Obtém a lista paginada de ratings.
    /// Apenas administradores podem consultar todas as avaliações.
    /// </summary>
    /// <param name="dto">Critérios de paginação.</param>
    /// <returns>Lista paginada de avaliações.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetRatings([FromQuery] GetRatingsReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        IQueryable<Rating> query = _db.Ratings;

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var ratings = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetRatingResDTO(
                r.UserId,
                r.Stars,
                r.Title,
                r.Body,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = ratings.Count > maxResults;
        var paginatedRatings = ratings.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedRatings[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetRatingsResDTO(
            paginatedRatings,
            hasMoreResults,
            lastTimestamp
        ));
    }

    /// <summary>
    /// Obtém a avaliação de um utilizador específico.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="userId">Identificador do utilizador.</param>
    /// <returns>Dados da avaliação do utilizador.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetRating(string userId)
    {
        var rating = await _db.Ratings
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId);

        if (rating is null) return NotFound();

        return Ok(new GetRatingResDTO(
            rating.UserId,
            rating.Stars,
            rating.Title,
            rating.Body,
            rating.CreatedAt
        ));
    }

    #endregion

    #region DeleteRating

    /// <summary>
    /// Remove uma avaliação existente.
    /// Apenas o autor da avaliação ou um administrador a podem eliminar.
    /// </summary>
    /// <param name="id">Identificador da avaliação.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRating(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var rating = await _db.Ratings.FindAsync(id);
        if (rating is null) return NotFound();
        var isOwner = rating.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner && !isAdmin) return Forbid();
        _db.Ratings.Remove(rating);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #endregion
}