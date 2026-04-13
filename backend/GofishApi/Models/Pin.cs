using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa a entidade base abstrata para todos os tipos de pins da aplicação.
/// Define atributos comuns como autor, localização, visibilidade, datas, conteúdo e relações.
/// </summary>
/// <remarks>
/// Esta classe serve de base para especializações como <see cref="CatchPin"/>,
/// <see cref="InfoPin"/> e outros tipos de pins do sistema.
/// </remarks>
public abstract class Pin
{
    // | Case                            | Use             |
    // | ------------------------------- | --------------- |
    // | Required scalar(like `UserId`)  | required        |
    // | Navigation property             | = null!         |
    // | Optional property               | neither(?)      |

    #region Scalar Properties

    /// <summary>
    /// Identificador único do pin.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do utilizador que criou o pin.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Latitude da localização associada ao pin.
    /// </summary>
    [Range(-90, 90)]
    public required double Latitude { get; set; }

    /// <summary>
    /// Longitude da localização associada ao pin.
    /// </summary>
    [Range(-180, 180)]
    public required double Longitude { get; set; }

    /// <summary>
    /// Tipo do pin.
    /// Permite distinguir entre diferentes subclasses e comportamentos.
    /// </summary>
    public required PinKind Kind { get; set; }

    /// <summary>
    /// Nível de visibilidade do pin.
    /// Controla quem pode consultar o conteúdo.
    /// </summary>
    public required VisibilityLevel Visibility { get; set; }

    /// <summary>
    /// Data de criação do pin.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Data de expiração do pin.
    /// Após esta data, o pin pode deixar de ser considerado válido ou visível.
    /// </summary>
    public required DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Pontuação agregada do pin, normalmente derivada de votos.
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Conteúdo textual associado ao pin.
    /// </summary>
    [MaxLength(2000)]
    public string? Body { get; set; }

    /// <summary>
    /// URL da imagem associada ao pin.
    /// </summary>
    [Url]
    [MaxLength(2000)]
    public string? ImageUrl { get; set; }

    #endregion
    #region Navigation Properties

    /// <summary>
    /// Utilizador autor do pin.
    /// </summary>
    public AppUser AppUser { get; set; } = null!;

    /// <summary>
    /// Lista de votos associados ao pin.
    /// </summary>
    public List<Vote> Votes { get; set; } = new();

    /// <summary>
    /// Lista de comentários associados ao pin.
    /// </summary>
    public List<Comment> Comments { get; set; } = new();

    /// <summary>
    /// Lista de grupos associados ao pin.
    /// </summary>
    public List<Group> Groups { get; set; } = new();

    /// <summary>
    /// Relações de associação entre pins e grupos.
    /// </summary>
    public List<GroupPin> GroupPins { get; set; } = new();

    #endregion
    #region Computed Properties

    /// <summary>
    /// Número total de comentários associados ao pin.
    /// </summary>
    public int CommentCount => Comments.Count;

    #endregion
}