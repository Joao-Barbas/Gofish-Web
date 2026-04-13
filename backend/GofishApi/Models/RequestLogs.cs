namespace GofishApi.Models;

/// <summary>
/// Representa o registo de uma requisição HTTP processada pela API.
/// Utilizado para monitorização, métricas e análise de desempenho.
/// </summary>
public class RequestLogs
{
    /// <summary>
    /// Identificador único do registo.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Método HTTP da requisição (ex: GET, POST, PUT, DELETE).
    /// </summary>
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// Endpoint (path) da API que foi chamado.
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// Código de estado HTTP devolvido pela API.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Data e hora em que a requisição foi processada.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Duração da requisição em milissegundos.
    /// </summary>
    public long DurationMs { get; set; }
}