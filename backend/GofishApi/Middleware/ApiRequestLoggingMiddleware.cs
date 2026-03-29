namespace GofishApi.Middleware;

using System.Diagnostics;
using GofishApi.Data;
using GofishApi.Models;

public class ApiRequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public ApiRequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            var log = new RequestLogs
            {
                Method = context.Request.Method,
                Path = context.Request.Path,
                StatusCode = context.Response.StatusCode,
                CreatedAt = DateTime.UtcNow,
                DurationMs = stopwatch.ElapsedMilliseconds
            };

            db.RequestLogs.Add(log);
            await db.SaveChangesAsync();
        }
    }
}
