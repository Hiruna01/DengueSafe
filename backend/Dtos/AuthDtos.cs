using System.ComponentModel.DataAnnotations;
using HackathonApi.Models;

namespace HackathonApi.Dtos;

public record LoginDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; init; } = string.Empty;
}

/// <summary>A signed token, who it belongs to, and when it stops working.</summary>
public record AuthResponseDto(string Token, OfficerDto Officer, DateTime ExpiresAt);

/// <summary>
/// An officer account as the API returns it.
/// <para>
/// Carries no <c>PasswordHash</c>, and must never gain one: this DTO is served
/// to every signed-in Admin and echoed back on login.
/// </para>
/// </summary>
public record OfficerDto(
    int Id,
    string FullName,
    string Email,
    string MohArea,
    OfficerRole Role,
    bool IsActive,
    DateTime CreatedAt,
    string? CreatedByName);

public record CreateOfficerDto
{
    [Required(ErrorMessage = "FullName is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "FullName must be between 1 and 100 characters.")]
    public string FullName { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "MohArea is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "MohArea must be between 1 and 100 characters.")]
    public string MohArea { get; init; } = string.Empty;

    /// <summary>
    /// Nullable for the reason every other required enum on a create DTO is:
    /// [Required] on a non-nullable enum is inert, so omitting it would quietly
    /// create an Officer — or worse, an Admin — by position.
    /// </summary>
    [Required(ErrorMessage = "Role is required.")]
    [EnumDataType(typeof(OfficerRole), ErrorMessage = "Role must be one of: Officer, Admin.")]
    public OfficerRole? Role { get; init; }
}

public record UpdateOfficerDto
{
    [StringLength(100, MinimumLength = 1, ErrorMessage = "FullName must be between 1 and 100 characters.")]
    public string? FullName { get; init; }

    [StringLength(100, ErrorMessage = "MohArea cannot exceed 100 characters.")]
    public string? MohArea { get; init; }

    [EnumDataType(typeof(OfficerRole), ErrorMessage = "Role must be one of: Officer, Admin.")]
    public OfficerRole? Role { get; init; }
}

public record SetOfficerActiveDto
{
    [Required(ErrorMessage = "IsActive is required.")]
    public bool? IsActive { get; init; }
}

/// <summary>Query options for <c>GET /api/officers</c>.</summary>
public record OfficerQueryParameters
{
    /// <summary>Matched case-insensitively against full name and email.</summary>
    public string? Search { get; init; }

    public OfficerRole? Role { get; init; }

    public bool? IsActive { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or greater.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; init; } = 10;
}
