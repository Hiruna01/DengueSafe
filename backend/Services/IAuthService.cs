using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface IAuthService
{
    /// <summary>
    /// Verifies credentials and issues a token.
    /// </summary>
    /// <exception cref="Middleware.BadRequestException">
    /// The email is unknown, the password is wrong, or the account is
    /// deactivated.
    /// </exception>
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);

    /// <summary>The signed-in officer, for confirming a stored token still works.</summary>
    /// <exception cref="Middleware.NotFoundException">No officer with that id exists.</exception>
    Task<OfficerDto> GetCurrentAsync(int officerId, CancellationToken cancellationToken = default);
}
