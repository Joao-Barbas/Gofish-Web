using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa um pin do tipo informativo.
/// Contém informação relevante sobre locais de pesca, como condições de acesso e características do fundo.
/// </summary>
public class InfoPin : Pin
{
    /// <summary>
    /// Número de dias até expiração automática deste tipo de pin.
    /// </summary>
    public const int ExpiresInDays = 60;

    // Scalar properties

    /// <summary>
    /// Nível de dificuldade de acesso ao local.
    /// </summary>
    public required AccessDifficulty AccessDifficulty { get; set; }

    /// <summary>
    /// Tipo de fundo (ex: rochoso, arenoso, etc.).
    /// </summary>
    public required Seabed Seabed { get; set; }
}