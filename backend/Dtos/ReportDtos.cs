using System.ComponentModel.DataAnnotations;
using HackathonApi.Models;

namespace HackathonApi.Dtos;

/// <summary>
/// A breeding-site report as the API returns it.
/// <para>
/// Deliberately carries no <c>ReporterPhone</c>: the number is collected so an
/// inspector can follow up, not so it can be handed to every dashboard client.
/// </para>
/// </summary>
public record ReportDto(
    int Id,
    SiteType SiteType,
    string SiteTypeLabel,
    int DivisionId,
    string DivisionName,
    string Description,
    string Landmark,
    string ReporterName,
    ReportStatus Status,
    DateTime ReportedAt,
    DateTime? InspectedAt,
    string? InspectorNote,
    double RiskScore,
    int DaysOpen);

public record CreateReportDto
{
    [Required(ErrorMessage = "SiteType is required.")]
    [EnumDataType(typeof(SiteType), ErrorMessage = "SiteType must be one of: DiscardedTyres, WaterStorageTank, ConstructionSite, RoofGutter, PlantPotSaucer, OrnamentalPond.")]
    public SiteType? SiteType { get; init; }

    [Required(ErrorMessage = "DivisionId is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "DivisionId must be a positive number.")]
    public int DivisionId { get; init; }

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(500, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 500 characters.")]
    public string Description { get; init; } = string.Empty;

    [StringLength(200, ErrorMessage = "Landmark cannot exceed 200 characters.")]
    public string Landmark { get; init; } = string.Empty;

    [Required(ErrorMessage = "ReporterName is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "ReporterName must be between 1 and 100 characters.")]
    public string ReporterName { get; init; } = string.Empty;

    /// <summary>Sri Lankan mobile number in local format, e.g. 0771234567.</summary>
    [Required(ErrorMessage = "ReporterPhone is required.")]
    [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "ReporterPhone must be 10 digits starting with 0, e.g. 0771234567.")]
    public string ReporterPhone { get; init; } = string.Empty;
}

public record UpdateReportStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    [EnumDataType(typeof(ReportStatus), ErrorMessage = "Status must be one of: Reported, Inspected, Cleared, NoticeIssued.")]
    public ReportStatus? Status { get; init; }

    [StringLength(500, ErrorMessage = "InspectorNote cannot exceed 500 characters.")]
    public string? InspectorNote { get; init; }
}

/// <summary>
/// Query options for <c>GET /api/reports/by-phone</c> — the one anonymous read
/// of the report list.
/// <para>
/// A separate shape from <see cref="ReportQueryParameters"/> on purpose: the
/// public endpoint takes a phone number and nothing else, so no anonymous
/// caller can reach the queue by simply omitting a filter.
/// </para>
/// </summary>
public record ReportPhoneLookupParameters
{
    [Required(ErrorMessage = "Phone is required.")]
    [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "Phone must be 10 digits starting with 0, e.g. 0771234567.")]
    public string Phone { get; init; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or greater.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; init; } = 100;
}

/// <summary>Query options for <c>GET /api/reports</c>.</summary>
public record ReportQueryParameters
{
    public int? DivisionId { get; init; }

    public SiteType? SiteType { get; init; }

    public ReportStatus? Status { get; init; }

    /// <summary>Matched case-insensitively against description and landmark.</summary>
    public string? Search { get; init; }

    /// <summary>
    /// The reporter's phone number, matched in full. This is how a resident
    /// finds what they filed without signing in, so it is an exact lookup
    /// rather than a search — a partial number must not return other people's
    /// reports. The number itself is still never returned in <see cref="ReportDto"/>.
    /// </summary>
    [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "Phone must be 10 digits starting with 0, e.g. 0771234567.")]
    public string? Phone { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or greater.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; init; } = 10;
}
