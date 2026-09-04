using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

/// <summary>
/// A public health officer who can sign in.
/// <para>
/// Accounts are created by an existing Admin rather than self-registered —
/// this is staff software, and <see cref="CreatedById"/> keeps the trail of who
/// admitted whom. Deactivation is preferred to deletion so that trail survives.
/// </para>
/// </summary>
public class Officer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    /// <summary>Used to sign in; unique across active and inactive accounts.</summary>
    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// A BCrypt hash, never a password. Deliberately absent from every DTO the
    /// API returns.
    /// </summary>
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Medical Officer of Health area this officer works.</summary>
    [MaxLength(100)]
    public string MohArea { get; set; } = string.Empty;

    public OfficerRole Role { get; set; }

    /// <summary>
    /// False blocks sign-in while leaving the account, and everything recorded
    /// against it, in place.
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// The Admin who created this account. Null for the accounts laid down by
    /// the seeder, which had nobody to create them.
    /// </summary>
    public int? CreatedById { get; set; }

    public Officer? CreatedBy { get; set; }
}
