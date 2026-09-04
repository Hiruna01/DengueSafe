using System.Text.Json;

namespace HackathonApi.Middleware;

/// <summary>
/// Converts unhandled exceptions into a consistent JSON error response.
/// Registered as the first middleware so it wraps the whole pipeline.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            _logger.LogInformation(ex, "Resource not found for {Path}", context.Request.Path);
            await WriteAsync(context, StatusCodes.Status404NotFound, ex.Message, detail: null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path);

            // Only leak stack traces outside production.
            var detail = _environment.IsProduction() ? null : ex.ToString();
            await WriteAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "An unexpected error occurred while processing the request.",
                detail);
        }
    }

    private static async Task WriteAsync(HttpContext context, int statusCode, string message, string? detail)
    {
        if (context.Response.HasStarted)
        {
            // Headers are already on the wire; nothing useful we can add.
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = new ErrorResponse(message, detail);
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, SerializerOptions));
    }

    private sealed record ErrorResponse(string Message, string? Detail);
}
