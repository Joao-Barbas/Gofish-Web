using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GofishApi.Controllers;

/// <summary>
/// Controlador responsável pela criação, consulta, resolução e remoção de reports
/// sobre pins e comentários.
/// </summary>
[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ReportController : ControllerBase
{
    /// <summary>Logger para registo de eventos e erros.</summary>
    private readonly ILogger<ReportController> _logger;

    /// <summary>Contexto de acesso à base de dados da aplicação.</summary>
    private readonly AppDbContext _db;

    /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>
    /// Inicializa uma nova instância do controlador de reports.
    /// </summary>
    /// <param name="logger">Logger da aplicação.</param>
    /// <param name="db">Contexto da base de dados.</param>
    /// <param name="userManager">Gestor de utilizadores.</param>
    public ReportController(
        ILogger<ReportController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    #region CreateReports

    /// <summary>
    /// Cria um novo report sobre um pin.
    /// O utilizador autenticado só pode reportar o mesmo pin uma vez.
    /// </summary>
    /// <param name="dto">Dados do report do pin.</param>
    /// <returns>Identificador do report criado.</returns>
    [HttpPost("CreatePinReport")]
    public async Task<IActionResult> CreatePinReport([FromBody] CreatePinReportReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var pinExists = await _db.Pins.AnyAsync(p => p.Id == dto.PinId);
        if (!pinExists)
            return NotFound("Pin not found");

        var alreadyReported = await _db.PinReports
            .AnyAsync(r => r.UserId == userId && r.PinId == dto.PinId);

        if (alreadyReported)
            return BadRequest("You already reported this pin");

        var report = new PinReport
        {
            PinId = dto.PinId,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow,
            Description = dto.Description,
            UserId = userId
        };

        _db.PinReports.Add(report);
        await _db.SaveChangesAsync();
        return Ok(new CreatePinReportResDTO(report.Id));
    }

    /// <summary>
    /// Cria um novo report sobre um comentário.
    /// O utilizador autenticado só pode reportar o mesmo comentário uma vez.
    /// </summary>
    /// <param name="dto">Dados do report do comentário.</param>
    /// <returns>Identificador do report criado.</returns>
    [HttpPost("CreateCommentReport")]
    public async Task<IActionResult> CreateCommentReport([FromBody] CreateCommentReportReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var commentExists = await _db.Comments.AnyAsync(p => p.Id == dto.CommentId);
        if (!commentExists)
            return NotFound("Pin not found");

        var alreadyReported = await _db.CommentReports
            .AnyAsync(r => r.UserId == userId && r.CommentId == dto.CommentId);

        if (alreadyReported)
            return BadRequest("You already reported this pin");

        var report = new CommentReport
        {
            CommentId = dto.CommentId,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow,
            Description = dto.Description,
            UserId = userId
        };

        _db.CommentReports.Add(report);
        await _db.SaveChangesAsync();
        return Ok(new CreateCommentReportResDTO(report.Id));
    }

    #endregion

    #region GetPinReports

    /// <summary>
    /// Obtém a lista paginada de reports de pins.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="dto">Critérios de paginação.</param>
    /// <returns>Lista paginada de reports de pins.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReports")]
    public async Task<IActionResult> GetPinsReports([FromQuery] GetReportReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<PinReport> query = _db.PinReports;

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var pinreports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
                "Pin",
                r.PinId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = pinreports.Count > maxResults;
        var paginatedReports = pinreports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    /// <summary>
    /// Obtém um report de pin específico pelo seu identificador.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="id">Identificador do report.</param>
    /// <returns>Dados do report de pin.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReport/{id}")]
    public async Task<IActionResult> GetPinReports(int id)
    {
        var report = await _db.PinReports
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report is null) return NotFound();

        return Ok(new GetReportResDTO(
            report.Id,
            report.UserId,
            report.AppUser.UserProfile.AvatarUrl,
            report.AppUser.UserName,
            "Pin",
            report.PinId,
            report.ReasonText,
            report.Description,
            report.CreatedAt
        ));
    }

    /// <summary>
    /// Obtém a lista paginada de reports associados a um pin específico.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="dto">Identificador do pin e critérios de paginação.</param>
    /// <returns>Lista paginada de reports do pin indicado.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReportsByPin")]
    public async Task<IActionResult> GetPinReportsByPin([FromQuery] GetPinReportsByPinReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<PinReport> query = _db.PinReports
            .Where(r => r.PinId == dto.PinId);

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var pinReports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
                "Pin",
                r.PinId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = pinReports.Count > maxResults;
        var paginatedReports = pinReports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    #endregion

    #region GetCommentReports

    /// <summary>
    /// Obtém a lista paginada de reports de comentários.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="dto">Critérios de paginação.</param>
    /// <returns>Lista paginada de reports de comentários.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetCommentReports")]
    public async Task<IActionResult> GetCommentReports([FromQuery] GetReportReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<CommentReport> query = _db.CommentReports;

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var commentReports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
                "Comment",
                r.CommentId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = commentReports.Count > maxResults;
        var paginatedReports = commentReports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    /// <summary>
    /// Obtém um report de comentário específico pelo seu identificador.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="id">Identificador do report.</param>
    /// <returns>Dados do report de comentário.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetCommentReport/{id}")]
    public async Task<IActionResult> GetCommentReport(int id)
    {
        var report = await _db.CommentReports
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report is null) return NotFound();

        return Ok(new GetReportResDTO(
            report.Id,
            report.UserId,
            report.AppUser.UserProfile.AvatarUrl,
            report.AppUser.UserName,
            "Comment",
            report.CommentId,
            report.ReasonText,
            report.Description,
            report.CreatedAt
        ));
    }

    /// <summary>
    /// Obtém a lista paginada de reports associados a um comentário específico.
    /// Apenas administradores podem consultar esta informação.
    /// </summary>
    /// <param name="dto">Identificador do comentário e critérios de paginação.</param>
    /// <returns>Lista paginada de reports do comentário indicado.</returns>
    [Authorize(Roles = "Admin")]
    [HttpGet("GetCommentReportsByComment")]
    public async Task<IActionResult> GetCommentReportsByComment([FromQuery] GetCommentsReportsByCommentReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<CommentReport> query = _db.CommentReports
            .Where(r => r.CommentId == dto.CommentId);

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var commentReports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
                "Comment",
                r.CommentId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = commentReports.Count > maxResults;
        var paginatedReports = commentReports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    #endregion

    #region DeleteReports

    /// <summary>
    /// Remove vários reports de pins de uma só vez.
    /// Apenas administradores podem executar esta operação.
    /// </summary>
    /// <param name="dto">Lista de identificadores de reports a remover.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [Authorize(Roles = "Admin")]
    [HttpDelete("DeletePinReports")]
    public async Task<IActionResult> DeletePinReports([FromBody] DeleteReportsReqDTO dto)
    {
        if (dto == null || dto.Ids == null || !dto.Ids.Any())
            return BadRequest("No ids provided");

        var reports = await _db.PinReports
            .Where(r => dto.Ids.Contains(r.Id))
            .ToListAsync();

        if (reports.Count == 0)
            return NotFound("No reports found");

        _db.PinReports.RemoveRange(reports);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Remove um report de comentário específico.
    /// Apenas administradores podem executar esta operação.
    /// </summary>
    /// <param name="id">Identificador do report.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [Authorize(Roles = "Admin")]
    [HttpDelete("DeleteCommentReport/{id}")]
    public async Task<IActionResult> DeleteCommentReport(int id)
    {
        var report = await _db.CommentReports.FindAsync(id);
        if (report is null) return NotFound();
        _db.CommentReports.Remove(report);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Remove vários reports de comentários de uma só vez.
    /// Apenas administradores podem executar esta operação.
    /// </summary>
    /// <param name="dto">Lista de identificadores de reports a remover.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [Authorize(Roles = "Admin")]
    [HttpDelete("DeleteCommentReports")]
    public async Task<IActionResult> DeleteCommentReports([FromBody] DeleteReportsReqDTO dto)
    {
        if (dto == null || dto.Ids == null || !dto.Ids.Any())
            return BadRequest("No ids provided");

        var reports = await _db.CommentReports
            .Where(r => dto.Ids.Contains(r.Id))
            .ToListAsync();

        if (reports.Count == 0)
            return NotFound("No reports found");

        _db.CommentReports.RemoveRange(reports);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Resolve um report de pin removendo o pin associado.
    /// Apenas administradores podem executar esta operação.
    /// </summary>
    /// <param name="reportId">Identificador do report.</param>
    /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
    [Authorize(Roles = "Admin")]
    [HttpDelete("ResolvePinReport/{reportId}")]
    public async Task<IActionResult> ResolvePinReport(int reportId)
    {
        var report = await _db.PinReports
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report is null)
            return NotFound("Report not found");

        var pin = await _db.Pins.FindAsync(report.PinId);

        if (pin is null)
            return NotFound("Associated pin not found");

        _db.Pins.Remove(pin);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    #endregion
}