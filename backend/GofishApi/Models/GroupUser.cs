using GofishApi.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa a relação entre utilizadores e grupos.
/// Inclui informação adicional como o papel (role) e a data de entrada.
/// </summary>
/// <remarks>
/// Esta entidade implementa uma relação many-to-many com metadata,
/// permitindo definir permissões dentro do grupo.
/// A chave primária é composta por <see cref="UserId"/> e <see cref="GroupId"/>.
/// </remarks>
public class GroupUser
{
    /// <summary>
    /// Identificador do utilizador.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Identificador do grupo.
    /// </summary>
    [ForeignKey(nameof(Group))]
    public required int GroupId { get; set; }

    /// <summary>
    /// Data em que o utilizador entrou no grupo.
    /// </summary>
    public DateTime JoinedAt { get; set; }

    /// <summary>
    /// Papel do utilizador dentro do grupo (Owner, Moderator, Member).
    /// </summary>
    public GroupRole Role { get; set; }

    // Navigation

    /// <summary>
    /// Utilizador associado ao grupo.
    /// </summary>
    public AppUser AppUser { get; set; }

    /// <summary>
    /// Grupo ao qual o utilizador pertence.
    /// </summary>
    public Group Group { get; set; }
}