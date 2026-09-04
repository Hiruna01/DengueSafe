namespace HackathonApi.Middleware;

/// <summary>
/// Thrown when a request is well-formed but cannot be honoured — a duplicate
/// email, or a change that would leave the system without an active Admin.
/// Translated to HTTP 400 by <see cref="ExceptionHandlingMiddleware"/>.
/// <para>
/// Named for the status it produces rather than "ValidationException", which
/// would collide with the DataAnnotations type that model binding already
/// throws.
/// </para>
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message)
        : base(message)
    {
    }
}
