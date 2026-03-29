namespace GofishApi.Models;

public class RequestLogs
{
    public int Id { get; set; }

    //Tipo de Request Http
    public string Method { get; set; } = string.Empty;

    //Endpoint chamado
    public string Path { get; set; } = string.Empty;

    //Status code da resposta
    public int StatusCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public long DurationMs { get; set; }
}