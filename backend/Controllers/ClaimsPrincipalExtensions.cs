using System.Security.Claims;
using HackathonApi.Middleware;

namespace HackathonApi.Controllers;

internal static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// The signed-in officer's id, from the token. Only ever called behind
    /// <c>[Authorize]</c>, so a missing or unparseable claim means a token this
    /// application did not issue rather than an anonymous caller.
    /// </summary>
    public static int GetOfficerId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(claim, out var id)
            ? id
            : throw new BadRequestException("The token is missing a valid officer id.");
    }
}
