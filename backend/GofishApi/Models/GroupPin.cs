using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa a relação many-to-many entre pins e grupos.
/// Permite associar um pin a múltiplos grupos e vice-versa.
/// </summary>
/// <remarks>
/// Esta entidade não possui estado próprio, sendo utilizada apenas como tabela de junção.
/// A chave primária é composta por <see cref="PinId"/> e <see cref="GroupId"/>.
/// </remarks>
public class GroupPin
{
    /// <summary>
    /// Identificador do pin associado.
    /// </summary>
    [ForeignKey(nameof(Pin))]
    public int PinId { get; set; }

    /// <summary>
    /// Identificador do grupo associado.
    /// </summary>
    [ForeignKey(nameof(Group))]
    public int GroupId { get; set; }

    // Navigation

    /// <summary>
    /// Pin associado ao grupo.
    /// </summary>
    public Pin Pin { get; set; } = null!;

    /// <summary>
    /// Grupo ao qual o pin pertence.
    /// </summary>
    public Group Group { get; set; } = null!;
}