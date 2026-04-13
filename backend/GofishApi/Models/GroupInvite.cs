using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa um convite para um utilizador entrar num grupo.
/// Controla o fluxo de entrada em grupos privados ou moderados.
/// </summary>
public class GroupInvite
{
    /// <summary>
    /// Identificador único do convite.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Identificador do grupo ao qual o utilizador está a ser convidado.
    /// </summary>
    [ForeignKey(nameof(Group))]
    public required int GroupId { get; set; }

    /// <summary>
    /// Identificador do utilizador que enviou o convite.
    /// </summary>
    [ForeignKey(nameof(Requester))]
    public required string RequesterUserId { get; set; }

    /// <summary>
    /// Identificador do utilizador que recebe o convite.
    /// </summary>
    [ForeignKey(nameof(Receiver))]
    public required string ReceiverUserId { get; set; }

    /// <summary>
    /// Data de criação do convite.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Estado atual do convite (ex: Pending, Accepted, Rejected).
    /// </summary>
    public required FriendshipState State { get; set; }

    // Navigation

    /// <summary>
    /// Grupo associado ao convite.
    /// </summary>
    public Group Group { get; set; } = null!;

    /// <summary>
    /// Utilizador que enviou o convite.
    /// </summary>
    public AppUser Requester { get; set; } = null!;

    /// <summary>
    /// Utilizador que recebeu o convite.
    /// </summary>
    public AppUser Receiver { get; set; } = null!;
}