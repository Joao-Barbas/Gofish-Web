using GofishApi.Enums;
using Microsoft.OpenApi.Extensions;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Define o contrato comum para entidades de reporte/moderação.
/// Expõe a informação base necessária para tratamento e apresentação de reports.
/// </summary>
public interface IReport
{
    /// <summary>
    /// Identificador único do report.
    /// </summary>
    int Id { get; }

    /// <summary>
    /// Motivo do report em formato textual legível.
    /// </summary>
    string ReasonText { get; }

    /// <summary>
    /// Data de criação do report.
    /// </summary>
    DateTime CreatedAt { get; }

    /// <summary>
    /// Identificador do utilizador que submeteu o report.
    /// </summary>
    string UserId { get; }

    /// <summary>
    /// Descrição adicional fornecida pelo utilizador.
    /// </summary>
    string? Description { get; }
}

/// <summary>
/// Representa um report submetido sobre um pin.
/// </summary>
public sealed class PinReport : IReport
{
    /// <summary>
    /// Identificador único do report.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do utilizador que submeteu o report.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Identificador do pin reportado.
    /// </summary>
    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    /// <summary>
    /// Motivo enum do report de pin.
    /// </summary>
    public required PinReportReason Reason { get; set; }

    /// <summary>
    /// Data de criação do report.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Descrição adicional fornecida pelo utilizador.
    /// </summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    // Navigation 

    /// <summary>
    /// Utilizador que submeteu o report.
    /// </summary>
    public AppUser AppUser { get; set; } = default!;

    /// <summary>
    /// Pin associado ao report.
    /// </summary>
    public Pin Pin { get; set; } = default!;

    // Computed

    /// <summary>
    /// Motivo do report em formato textual legível.
    /// </summary>
    public string ReasonText => Reason.GetDisplayName();
}

/// <summary>
/// Representa um report submetido sobre um comentário.
/// </summary>
public sealed class CommentReport : IReport
{
    /// <summary>
    /// Identificador único do report.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do utilizador que submeteu o report.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Identificador do comentário reportado.
    /// </summary>
    [ForeignKey(nameof(Comment))]
    public required int CommentId { get; set; }

    /// <summary>
    /// Motivo enum do report de comentário.
    /// </summary>
    public required CommentReportReason Reason { get; set; }

    /// <summary>
    /// Data de criação do report.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Descrição adicional fornecida pelo utilizador.
    /// </summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    // Navigation 

    /// <summary>
    /// Utilizador que submeteu o report.
    /// </summary>
    public AppUser AppUser { get; set; } = default!;

    /// <summary>
    /// Comentário associado ao report.
    /// </summary>
    public Comment Comment { get; set; } = default!;

    // Computed

    /// <summary>
    /// Motivo do report em formato textual legível.
    /// </summary>
    public string ReasonText => Reason.GetDisplayName();
}