using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

/// <summary>
/// Representa um grupo de utilizadores.
/// Permite organizar utilizadores e pins em comunidades.
/// </summary>
public class Group
{
    /// <summary>
    /// Identificador único do grupo.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Nome do grupo.
    /// </summary>
    [MaxLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Nome normalizado do grupo (usado para pesquisa e unicidade).
    /// Geralmente armazenado em maiúsculas.
    /// </summary>
    [MaxLength(100)]
    public required string NormalizedName { get; set; }

    /// <summary>
    /// Descrição do grupo.
    /// </summary>
    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// URL da imagem de avatar do grupo.
    /// </summary>
    [Url]
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Data de criação do grupo.
    /// </summary>
    [Required]
    public required DateTime CreatedAt { get; set; }

    // Navigation 

    /// <summary>
    /// Lista de pins associados ao grupo.
    /// </summary>
    public List<Pin> Pins { get; set; } = [];

    /// <summary>
    /// Relação intermédia entre grupos e pins.
    /// </summary>
    public List<GroupPin> GroupPins { get; set; } = [];

    /// <summary>
    /// Utilizadores associados ao grupo (relação direta).
    /// </summary>
    public List<AppUser> AppUsers { get; set; } = [];

    /// <summary>
    /// Relação intermédia entre utilizadores e grupos com informação adicional (ex: role).
    /// </summary>
    public List<GroupUser> GroupUsers { get; set; } = [];
}