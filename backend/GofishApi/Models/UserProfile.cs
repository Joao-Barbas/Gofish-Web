using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

/// <summary>
/// Representa o perfil público e estatístico de um utilizador.
/// Contém informação adicional não crítica à autenticação, como gamificação e atividade.
/// </summary>
public class UserProfile
{
    /// <summary>
    /// Identificador do utilizador associado ao perfil.
    /// Funciona como chave estrangeira e relação 1:1 com <see cref="AppUser"/>.
    /// </summary>
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    /// <summary>
    /// Biografia do utilizador.
    /// </summary>
    [MaxLength(500)]
    public string? Bio { get; set; }

    /// <summary>
    /// URL do avatar do utilizador.
    /// </summary>
    [Url]
    [MaxLength(2000)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Pontos totais acumulados pelo utilizador (gamificação).
    /// </summary>
    public int CatchPoints { get; set; } = 0;

    /// <summary>
    /// Pontos acumulados no mês anterior.
    /// Usado para cálculo de progresso mensal.
    /// </summary>
    public int CatchPointsLastMonth { get; set; } = 0;

    /// <summary>
    /// Data de registo do utilizador na plataforma.
    /// </summary>
    public DateTime JoinedAt { get; set; } = DateTime.Now;

    /// <summary>
    /// Última vez que o utilizador esteve ativo.
    /// </summary>
    public DateTime LastActiveAt { get; set; } = DateTime.Now;

    /// <summary>
    /// Número de semanas consecutivas com atividade (streak atual).
    /// </summary>
    public int WeeklyStreak { get; set; } = 0;

    /// <summary>
    /// Maior streak semanal atingido pelo utilizador.
    /// </summary>
    public int MaxWeeklyStreak { get; set; } = 0;

    /// <summary>
    /// Data da última atualização do perfil.
    /// </summary>
    public DateTime? LastUpdateAt { get; set; }

    /// <summary>
    /// Data de início da última semana em que o utilizador criou um pin.
    /// Usado para cálculo de streak.
    /// </summary>
    public DateTime? LastPinWeekStart { get; set; }

    // Navigation

    /// <summary>
    /// Utilizador associado ao perfil.
    /// </summary>
    public AppUser AppUser { get; set; } = null!;

    // Computed

    /// <summary>
    /// Diferença de pontos entre o valor atual e o mês anterior.
    /// </summary>
    public int MonthlyPointsDelta => CatchPoints - CatchPointsLastMonth;
}