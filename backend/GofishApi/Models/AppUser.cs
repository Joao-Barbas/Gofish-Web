using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using UUIDNext;
using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa o utilizador da aplicação.
/// Estende <see cref="IdentityUser"/> com dados pessoais, preferências de segurança
/// e navegações para entidades relacionadas do domínio.
/// </summary>
public class AppUser : IdentityUser
{
    #region Scalar

    /// <summary>
    /// Primeiro nome do utilizador.
    /// </summary>
    [PersonalData]
    [StringLength(256)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Último nome do utilizador.
    /// </summary>
    [PersonalData]
    [StringLength(256)]
    public string? LastName { get; set; }

    /// <summary>
    /// Nome de apresentação visível na aplicação.
    /// </summary>
    [PersonalData]
    [StringLength(50)]
    public string DisplayName { get; set; } = "";

    /// <summary>
    /// Data de nascimento do utilizador.
    /// </summary>
    [PersonalData]
    public DateTime? BirthDate { get; set; }

    /// <summary>
    /// Género do utilizador.
    /// </summary>
    [PersonalData]
    public Gender? Gender { get; set; }

    /// <summary>
    /// Método de autenticação de dois fatores atualmente configurado.
    /// </summary>
    [PersonalData]
    [DefaultValue(TwoFactorMethod.None)]
    public TwoFactorMethod TwoFactorMethod { get; set; } = TwoFactorMethod.None;

    /// <summary>
    /// Data de criação da conta do utilizador.
    /// </summary>
    [PersonalData]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    #endregion // Scalar
    #region Navigation

    /// <summary>
    /// Perfil associado ao utilizador.
    /// Deve existir sempre.
    /// </summary>
    public UserProfile UserProfile { get; set; } = null!;

    /// <summary>
    /// Avaliação submetida pelo utilizador.
    /// </summary>
    public Rating? Rating { get; set; }

    /// <summary>
    /// Pedidos de amizade enviados pelo utilizador.
    /// </summary>
    public List<Friendship> RequestedFriendships { get; set; } = [];

    /// <summary>
    /// Pedidos de amizade recebidos pelo utilizador.
    /// </summary>
    public List<Friendship> ReceivedFriendships { get; set; } = [];

    /// <summary>
    /// Votos efetuados pelo utilizador.
    /// </summary>
    public List<Vote> Votes { get; set; } = [];

    /// <summary>
    /// Grupos aos quais o utilizador pertence.
    /// </summary>
    public List<Group> Groups { get; set; } = [];

    /// <summary>
    /// Relações de associação entre utilizador e grupos.
    /// </summary>
    public List<GroupUser> GroupUsers { get; set; } = [];

    /// <summary>
    /// Pins criados pelo utilizador.
    /// </summary>
    public List<Pin> Pins { get; set; } = [];

    #endregion // Navigation
    #region Constructor

    /// <summary>
    /// Inicializa uma nova instância de <see cref="AppUser"/>.
    /// </summary>
    /// <remarks>
    /// A propriedade <see cref="IdentityUser.Id"/> é inicializada com um UUIDv8
    /// otimizado para base de dados.  
    /// A propriedade <see cref="IdentityUser.SecurityStamp"/> é também inicializada.
    /// </remarks>
    public AppUser()
    {
        Id = Uuid.NewDatabaseFriendly(Database.SqlServer).ToString();
        SecurityStamp = Guid.NewGuid().ToString();
    }

    /// <summary>
    /// Inicializa uma nova instância de <see cref="AppUser"/> com username.
    /// </summary>
    /// <param name="userName">Nome de utilizador.</param>
    /// <remarks>
    /// A propriedade <see cref="IdentityUser.Id"/> é inicializada com um UUIDv8
    /// otimizado para base de dados.  
    /// A propriedade <see cref="IdentityUser.SecurityStamp"/> é também inicializada.
    /// </remarks>
    public AppUser(string userName) : this()
    {
        UserName = userName;
    }

    #endregion // Constructor
}