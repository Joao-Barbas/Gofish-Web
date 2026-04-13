using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Controllers;

/// <summary>
/// Controlador responsável pela disponibilização de métricas e estatísticas
/// sobre pins, utilizadores, reports e pedidos à API.
/// </summary>
[Route("api/[controller]/[action]")]
[ApiController]
public class StatsController : ControllerBase
{
    /// <summary>Logger para registo de eventos e erros.</summary>
    private readonly ILogger<StatsController> _logger;

    /// <summary>Contexto de acesso à base de dados da aplicação.</summary>
    private readonly AppDbContext _db;

    /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>
    /// Inicializa uma nova instância do controlador de estatísticas.
    /// </summary>
    /// <param name="logger">Logger da aplicação.</param>
    /// <param name="db">Contexto da base de dados.</param>
    /// <param name="userManager">Gestor de utilizadores.</param>
    public StatsController(
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
    /// Obtém o número de pins criados no dia atual em UTC.
    /// </summary>
    /// <returns>Total de pins criados hoje.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetPinsCreatedToday()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var value = await _db.Pins
            .CountAsync(p => p.CreatedAt >= today && p.CreatedAt < tomorrow);

        return Ok(new GetPinsCreatedTodayResDTO(value));
    }

    /// <summary>
    /// Obtém o número total de reports pendentes de revisão.
    /// Soma reports de pins e de comentários.
    /// </summary>
    /// <returns>Total de reports pendentes.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetReportsWaitingReview()
    {
        var pinReports = await _db.PinReports.CountAsync();
        var commentReports = await _db.CommentReports.CountAsync();

        var total = pinReports + commentReports;

        return Ok(new GetReportsWaitingReviewResDTO(total));
    }

    /// <summary>
    /// Obtém a média diária de pins publicados num determinado mês.
    /// </summary>
    /// <param name="month">Mês pretendido.</param>
    /// <param name="year">Ano pretendido.</param>
    /// <returns>Média diária de pins publicados no mês indicado.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAverageVotesPerPin(
        [FromQuery] int month,
        [FromQuery] int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Invalid month");

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        var totalPublishedPins = await _db.Pins
            .CountAsync(p => p.CreatedAt >= start && p.CreatedAt < end);

        var daysInMonth = DateTime.DaysInMonth(year, month);

        var average = Math.Round((double)totalPublishedPins / daysInMonth, 2);

        return Ok(new GetAverageVotesPerPinResDTO(average));
    }

    /// <summary>
    /// Obtém a média diária de pins publicados num determinado mês.
    /// </summary>
    /// <param name="month">Mês pretendido.</param>
    /// <param name="year">Ano pretendido.</param>
    /// <returns>Média diária de pins publicados no mês indicado.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAveragePublishedPins(
        [FromQuery] int month,
        [FromQuery] int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Invalid month");

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        var totalPublishedPins = await _db.Pins
            .CountAsync(p => p.CreatedAt >= start && p.CreatedAt < end);

        var daysInMonth = DateTime.DaysInMonth(year, month);

        var value = Math.Round((double)totalPublishedPins / daysInMonth, 2);

        return Ok(new GetAveragePublishedPinsResDTO(value));
    }

    /// <summary>
    /// Obtém o número de utilizadores ativos nos últimos 30 dias,
    /// considerando como ativo quem criou pelo menos um pin nesse período.
    /// </summary>
    /// <returns>Total de utilizadores ativos.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetActiveUsers()
    {
        var lastMonth = DateTime.UtcNow.AddDays(-30);

        var value = await _db.Pins
            .Where(p => p.CreatedAt >= lastMonth)
            .Select(p => p.UserId)
            .Distinct()
            .CountAsync();

        return Ok(new GetActiveUsersResDTO(value));
    }

    /// <summary>
    /// Obtém o número de pins com pelo menos 15 votos positivos.
    /// </summary>
    /// <returns>Total de pins com 15 ou mais upvotes.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetPinsWith15PositiveVotes()
    {
        var value = await _db.Pins
            .CountAsync(p => p.Votes.Count(v => v.Value == VoteKind.Upvote) >= 15);

        return Ok(new GetPinsWith15PositiveVotesResDTO(value));
    }

    /// <summary>
    /// Obtém a taxa de sucesso semanal dos pedidos à API,
    /// considerando como sucesso os códigos HTTP 2xx.
    /// </summary>
    /// <returns>Percentagem de sucesso dos pedidos nos últimos 7 dias.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetWeeklyApiSuccessRate()
    {
        var start = DateTime.UtcNow.AddDays(-7);

        var totalRequests = await _db.RequestLogs
            .CountAsync(r => r.CreatedAt >= start);

        if (totalRequests == 0)
            return Ok(new GetSuccessRateOfRequestsDTO(0));

        var successfulRequests = await _db.RequestLogs
            .CountAsync(r =>
                r.CreatedAt >= start &&
                r.StatusCode >= 200 &&
                r.StatusCode < 300);

        var successRate = Math.Round((double)successfulRequests / totalRequests * 100, 2);

        return Ok(new GetSuccessRateOfRequestsDTO(successRate));
    }

    /// <summary>
    /// Obtém o número de novos utilizadores registados no dia atual em UTC.
    /// </summary>
    /// <returns>Total de utilizadores registados hoje.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetNewUsersToday()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var value = await _userManager.Users
            .CountAsync(u => u.CreatedAt >= today && u.CreatedAt < tomorrow);

        return Ok(new GetNewUsersTodayResDTO(value));
    }

    /// <summary>
    /// Obtém o número total de pins criados.
    /// </summary>
    /// <returns>Total de pins existentes.</returns>
    [HttpGet]
    public async Task<IActionResult> GetTotalPinsCreated()
    {
        var value = await _db.Pins.CountAsync();

        return Ok(new GetTotalPinsCreatedResDTO(value));
    }

    /// <summary>
    /// Obtém o número total de catch pins criados.
    /// </summary>
    /// <returns>Total de pins do tipo Catch.</returns>
    [HttpGet]
    public async Task<IActionResult> GetTotalCatchPinsCreated()
    {
        var value = await _db.Pins
            .CountAsync(p => p.Kind == PinKind.Catch);

        return Ok(new GetTotalCatchPinsCreatedResDTO(value));
    }

    /// <summary>
    /// Obtém o número total de utilizadores registados.
    /// </summary>
    /// <returns>Total de utilizadores.</returns>
    [HttpGet]
    public async Task<IActionResult> GetTotalUsers()
    {
        var value = await _userManager.Users.CountAsync();

        return Ok(new GetTotalUsersResDTO(value));
    }

    /// <summary>
    /// Obtém o número total de warning pins criados.
    /// </summary>
    /// <returns>Total de pins do tipo Warning.</returns>
    [HttpGet]
    public async Task<IActionResult> GetTotalWarningPinsCreated()
    {
        var value = await _db.Pins
            .CountAsync(p => p.Kind == PinKind.Warning);

        return Ok(new GetTotalWarningPinsCreatedResDTO(value));
    }

    /// <summary>
    /// Obtém estatísticas semanais de criação de pins num determinado mês,
    /// segmentadas por tipo de pin.
    /// </summary>
    /// <param name="dto">Ano e mês para cálculo das estatísticas.</param>
    /// <returns>Lista de intervalos semanais com totais por tipo de pin.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetPinsWeeklyStats([FromQuery] GetPinsWeeklyStatsReqDTO dto)
    {
        if (dto.Year < 2000 || dto.Year > 3000)
            return BadRequest("Invalid year.");

        if (dto.Month < 1 || dto.Month > 12)
            return BadRequest("Invalid month.");

        var startDate = new DateTime(dto.Year, dto.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1);

        var pins = await _db.Pins
            .AsNoTracking()
            .Where(p => p.CreatedAt >= startDate && p.CreatedAt < endDate)
            .Select(p => new
            {
                p.CreatedAt,
                p.Kind
            })
            .ToListAsync();

        var result = new List<GetPinsWeeklyStatsResDTO>();

        var cursor = startDate;
        var dayNumber = 1;

        while (cursor < endDate)
        {
            var next = cursor.AddDays(7);
            if (next > endDate)
                next = endDate;

            var catchCount = pins.Count(p =>
                p.CreatedAt >= cursor &&
                p.CreatedAt < next &&
                p.Kind == PinKind.Catch);

            var infoCount = pins.Count(p =>
                p.CreatedAt >= cursor &&
                p.CreatedAt < next &&
                p.Kind == PinKind.Information);

            var warningCount = pins.Count(p =>
                p.CreatedAt >= cursor &&
                p.CreatedAt < next &&
                p.Kind == PinKind.Warning);

            var lastDayOfRange = next.AddDays(-1).Day;

            result.Add(new GetPinsWeeklyStatsResDTO(
                Year: dto.Year,
                WeekLabel: $"Day {dayNumber} to day {lastDayOfRange}",
                CatchCount: catchCount,
                InfoCount: infoCount,
                WarningCount: warningCount
            ));

            dayNumber = next.Day;
            cursor = next;
        }

        return Ok(result);
    }

    /// <summary>
    /// Obtém estatísticas semanais de registo de utilizadores para um determinado ano.
    /// </summary>
    /// <param name="dto">Ano para cálculo das estatísticas.</param>
    /// <returns>Lista de intervalos semanais com número de utilizadores registados.</returns>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetRegisteredUsersWeeklyStats([FromQuery] GetRegisteredUsersWeeklyStatsReqDTO dto)
    {
        if (dto.Year < 2000 || dto.Year > 3000)
            return BadRequest("Invalid year.");

        var startDate = new DateTime(dto.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = dto.Year == DateTime.UtcNow.Year
            ? DateTime.UtcNow
            : startDate.AddYears(1);

        var usersCreatedAt = await _userManager.Users
            .AsNoTracking()
            .Where(u => u.CreatedAt >= startDate && u.CreatedAt < endDate)
            .Select(u => u.CreatedAt)
            .ToListAsync();

        var result = new List<GetRegisteredUsersWeeklyStatsResDTO>();

        var cursor = startDate;

        while (cursor < endDate)
        {
            var next = cursor.AddDays(7);
            if (next > endDate)
                next = endDate;

            var count = usersCreatedAt.Count(createdAt =>
                createdAt >= cursor && createdAt < next);

            result.Add(new GetRegisteredUsersWeeklyStatsResDTO(
                Label: $"{cursor:dd/MM} - {next.AddDays(-1):dd/MM}",
                Value: count
            ));

            cursor = next;
        }
        return Ok(result);
    }
}