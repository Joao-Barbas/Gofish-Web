using GofishApi.Dtos;
using GofishApi.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Controlador responsável por expor valores de enums da aplicação.
/// Permite ao frontend obter listas tipadas para preenchimento de UI (dropdowns, filtros, etc).
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/Enumerate/[action]")]
public class EnumsController : ControllerBase
{
    /// <summary>
    /// Obtém os níveis de dificuldade de acesso.
    /// </summary>
    /// <returns>Lista de valores do enum AccessDifficulty.</returns>
    [HttpGet]
    public IActionResult AccessDifficulty() => Ok(EnumDTO.FromEnum<AccessDifficulty>());

    /// <summary>
    /// Obtém os tipos de isco (bait).
    /// </summary>
    /// <returns>Lista de valores do enum Bait.</returns>
    [HttpGet]
    public IActionResult Bait() => Ok(EnumDTO.FromEnum<Bait>());

    /// <summary>
    /// Obtém os tipos de pins disponíveis.
    /// </summary>
    /// <returns>Lista de valores do enum PinKind.</returns>
    [HttpGet]
    public IActionResult PinKind() => Ok(EnumDTO.FromEnum<PinKind>());

    /// <summary>
    /// Obtém os tipos de fundo marinho.
    /// </summary>
    /// <returns>Lista de valores do enum Seabed.</returns>
    [HttpGet]
    public IActionResult Seabed() => Ok(EnumDTO.FromEnum<Seabed>());

    /// <summary>
    /// Obtém as espécies de peixe.
    /// </summary>
    /// <returns>Lista de valores do enum Species.</returns>
    [HttpGet]
    public IActionResult Species() => Ok(EnumDTO.FromEnum<Species>());

    /// <summary>
    /// Obtém os níveis de visibilidade de conteúdo.
    /// </summary>
    /// <returns>Lista de valores do enum VisibilityLevel.</returns>
    [HttpGet]
    public IActionResult VisibilityLevel() => Ok(EnumDTO.FromEnum<VisibilityLevel>());

    /// <summary>
    /// Obtém os tipos de avisos (warnings).
    /// </summary>
    /// <returns>Lista de valores do enum WarningKind.</returns>
    [HttpGet]
    public IActionResult WarningKind() => Ok(EnumDTO.FromEnum<WarningKind>());

    /// <summary>
    /// Obtém os métodos de autenticação de dois fatores.
    /// </summary>
    /// <returns>Lista de valores do enum TwoFactorMethod.</returns>
    [HttpGet]
    public IActionResult TwoFactorMethod() => Ok(EnumDTO.FromEnum<TwoFactorMethod>());

    /// <summary>
    /// Obtém os estados de amizade entre utilizadores.
    /// </summary>
    /// <returns>Lista de valores do enum FriendshipState.</returns>
    [HttpGet]
    public IActionResult FriendshipState() => Ok(EnumDTO.FromEnum<FriendshipState>());

    /// <summary>
    /// Obtém os motivos de reporte de pins.
    /// </summary>
    /// <returns>Lista de valores do enum PinReportReason.</returns>
    [HttpGet]
    public IActionResult PinReportReason() => Ok(EnumDTO.FromEnum<PinReportReason>());

    /// <summary>
    /// Obtém os motivos de reporte de comentários.
    /// </summary>
    /// <returns>Lista de valores do enum CommentReportReason.</returns>
    [HttpGet]
    public IActionResult CommentReportReason() => Ok(EnumDTO.FromEnum<CommentReportReason>());

    /// <summary>
    /// Obtém os tipos de voto (ex: upvote/downvote).
    /// </summary>
    /// <returns>Lista de valores do enum VoteKind.</returns>
    [HttpGet]
    public IActionResult VoteKind() => Ok(EnumDTO.FromEnum<VoteKind>());
}