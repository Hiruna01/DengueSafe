using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

/// <summary>
/// A public health administrative area. Reports and cases are aggregated by
/// division, which is the unit risk is scored on.
/// </summary>
public class Division
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Medical Officer of Health area the division belongs to.</summary>
    [MaxLength(100)]
    public string MohArea { get; set; } = string.Empty;

    [MaxLength(50)]
    public string District { get; set; } = string.Empty;
}
