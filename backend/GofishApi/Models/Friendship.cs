using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa uma relação de amizade entre dois utilizadores.
/// Pode estar em diferentes estados ao longo do seu ciclo de vida.
/// </summary>
public class Friendship
{
    /// <summary>
    /// Identificador único da relação de amizade.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do utilizador que iniciou o pedido de amizade.
    /// </summary>
    [ForeignKey(nameof(Requester))]
    public required string RequesterUserId { get; set; }

    /// <summary>
    /// Identificador do utilizador que recebe o pedido de amizade.
    /// </summary>
    [ForeignKey(nameof(Receiver))]
    public required string ReceiverUserId { get; set; }

    /// <summary>
    /// Estado atual da amizade (ex: Pending, Accepted, Rejected).
    /// </summary>
    public required FriendshipState State { get; set; }

    /// <summary>
    /// Data de criação do pedido de amizade.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Data em que o pedido foi respondido (aceite ou rejeitado).
    /// </summary>
    public DateTime? RepliedAt { get; set; }

    // Navigation

    /// <summary>
    /// Utilizador que enviou o pedido de amizade.
    /// </summary>
    public AppUser Requester { get; set; } = null!;

    /// <summary>
    /// Utilizador que recebeu o pedido de amizade.
    /// </summary>
    public AppUser Receiver { get; set; } = null!;
}