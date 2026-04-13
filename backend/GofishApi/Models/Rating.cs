using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa uma avaliação feita por um utilizador.
/// Cada utilizador pode ter no máximo uma avaliação associada.
/// </summary>
public class Rating
{
    /// <summary>
    /// Identificador do utilizador que realizou a avaliação.
    /// Funciona também como chave primária da entidade.
    /// </summary>
    [Key]
    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; }

    /// <summary>
    /// Data de criação da avaliação.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Classificação atribuída pelo utilizador (entre 1 e 5).
    /// </summary>
    [Range(1, 5)]
    public int Stars { get; set; }

    /// <summary>
    /// Título da avaliação.
    /// </summary>
    [MaxLength(200)]
    public string Title { get; set; }

    /// <summary>
    /// Conteúdo textual da avaliação.
    /// </summary>
    [MaxLength(2000)]
    public string Body { get; set; }

    // Navigation

    /// <summary>
    /// Utilizador que realizou a avaliação.
    /// </summary>
    public AppUser AppUser { get; set; } = null!;
}