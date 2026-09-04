namespace HackathonApi.Services;

/// <summary>
/// One place that decides how tokens are signed, so <c>Program.cs</c> (which
/// validates them) and <see cref="AuthService"/> (which issues them) cannot
/// drift apart.
/// </summary>
public static class JwtSettings
{
    public const string Issuer = "DengueWatch";

    public const string Audience = "DengueWatch";

    /// <summary>A working day, so a shift does not end with a surprise logout.</summary>
    public static readonly TimeSpan Lifetime = TimeSpan.FromHours(8);

    /// <summary>Claim carrying the officer's MOH area.</summary>
    public const string MohAreaClaim = "moh_area";

    /// <summary>HMAC-SHA256 needs at least 256 bits of key to be worth anything.</summary>
    private const int MinimumKeyLength = 32;

    /// <summary>
    /// The signing key, from the <c>JWT_SECRET</c> environment variable in any
    /// real deployment, falling back to <c>Jwt:Secret</c> in local (gitignored)
    /// development config. Throws rather than inventing a default: a silently
    /// generated key would sign tokens that stop validating on the next
    /// restart, and a hard-coded one would ship a public secret.
    /// </summary>
    public static string ResolveSigningKey(IConfiguration configuration)
    {
        var key = Environment.GetEnvironmentVariable("JWT_SECRET");

        if (string.IsNullOrWhiteSpace(key))
        {
            key = configuration["Jwt:Secret"];
        }

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException(
                "No JWT signing key. Set the JWT_SECRET environment variable, or Jwt:Secret in appsettings.Development.json for local work.");
        }

        if (key.Length < MinimumKeyLength)
        {
            throw new InvalidOperationException(
                $"The JWT signing key must be at least {MinimumKeyLength} characters.");
        }

        return key;
    }
}
