using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa um voto efetuado por um utilizador sobre um pin.
/// Utilizado para calcular a pontuação e relevância do conteúdo.
/// </summary>
public class Vote
{
    /// <summary>
    /// Identificador único do voto.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do pin associado ao voto.
    /// </summary>
    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    /// <summary>
    /// Identificador do utilizador que realizou o voto.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Valor do voto (ex: upvote ou downvote).
    /// </summary>
    public required VoteKind Value { get; set; }

    /// <summary>
    /// Data de criação do voto.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    // Navigation

    /// <summary>
    /// Pin associado ao voto.
    /// </summary>
    public Pin Pin { get; set; } = null!;

    /// <summary>
    /// Utilizador que realizou o voto.
    /// </summary>
    public AppUser AppUser { get; set; } = null!;
}