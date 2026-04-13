using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa um comentário associado a um pin.
/// Permite aos utilizadores interagir com conteúdo publicado.
/// </summary>
public class Comment
{
    /// <summary>
    /// Identificador único do comentário.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do pin ao qual o comentário pertence.
    /// </summary>
    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    /// <summary>
    /// Identificador do utilizador que criou o comentário.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Conteúdo textual do comentário.
    /// Limitado a 1000 caracteres.
    /// </summary>
    [MaxLength(1000)]
    public required string Body { get; set; }

    /// <summary>
    /// Data e hora de criação do comentário (UTC).
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    // Navigation

    /// <summary>
    /// Pin associado ao comentário.
    /// </summary>
    public Pin Pin { get; set; } = null!;

    /// <summary>
    /// Utilizador que criou o comentário.
    /// </summary>
    public AppUser AppUser { get; set; } = null!;
}