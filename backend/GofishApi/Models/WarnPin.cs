using GofishApi.Enums;

namespace GofishApi.Models;

/// <summary>
/// Representa um pin de aviso (warning), utilizado para alertar outros utilizadores
/// sobre perigos ou condições adversas num determinado local.
/// </summary>
public class WarnPin : Pin
{
    /// <summary>
    /// Número de dias até o pin expirar automaticamente.
    /// Pins de aviso têm curta duração devido à natureza temporária dos riscos.
    /// </summary>
    public const int ExpiresInDays = 3;

    // Scalar properties

    /// <summary>
    /// Tipo de aviso associado ao pin (ex: perigo, corrente forte, zona proibida).
    /// </summary>
    public required WarningKind WarningKind { get; set; }
}