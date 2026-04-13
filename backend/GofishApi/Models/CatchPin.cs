using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa um pin do tipo "captura", associado a uma atividade de pesca.
/// Contém informação específica sobre o peixe capturado e o equipamento utilizado.
/// </summary>
public class CatchPin : Pin
{
    /// <summary>
    /// Número de dias até expiração automática deste tipo de pin.
    /// </summary>
    public const int ExpiresInDays = 30;

    // Scalar properties

    /// <summary>
    /// Tamanho do anzol utilizado na captura.
    /// Segue o padrão europeu de tamanhos.
    /// </summary>
    [MaxLength(5)]
    public string? HookSize { get; set; }

    /// <summary>
    /// Espécie do peixe capturado.
    /// </summary>
    public Species? Species { get; set; }

    /// <summary>
    /// Tipo de isco utilizado na captura.
    /// </summary>
    public Bait? Bait { get; set; }
}