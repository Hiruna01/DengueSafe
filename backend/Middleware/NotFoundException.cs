namespace HackathonApi.Middleware;

/// <summary>
/// Thrown when a requested resource does not exist. Translated to HTTP 404 by
/// <see cref="ExceptionHandlingMiddleware"/>.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException()
        : base("The requested resource was not found.")
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public NotFoundException(string resource, object key)
        : base($"{resource} with key '{key}' was not found.")
    {
    }
}
